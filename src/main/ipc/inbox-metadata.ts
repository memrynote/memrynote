import { InboxChannels } from '@shared/ipc-channels'
import type { SocialMetadata } from '@shared/contracts/inbox-api'
import { inboxItems } from '@shared/db/schema/inbox'
import { eq } from 'drizzle-orm'
import { getItemAttachmentsDir } from '../inbox/attachments'
import { fetchUrlMetadata, downloadImage } from '../inbox/metadata'
import {
  extractSocialPost,
  detectSocialPlatform,
  createFallbackSocialMetadata
} from '../inbox/social'
import { emitInboxEvent, requireDatabase, METADATA_RETRY_DELAY } from './inbox-shared'

export async function fetchAndUpdateMetadata(
  itemId: string,
  url: string,
  retryCount = 0
): Promise<void> {
  let db: ReturnType<typeof requireDatabase>

  try {
    db = requireDatabase()
  } catch {
    console.warn('[Metadata] No database available, skipping metadata fetch')
    return
  }

  try {
    db.update(inboxItems)
      .set({
        processingStatus: 'processing',
        modifiedAt: new Date().toISOString()
      })
      .where(eq(inboxItems.id, itemId))
      .run()

    console.log(`[Metadata] Fetching metadata for ${url}`)
    const metadata = await fetchUrlMetadata(url)
    console.log(`[Metadata] Extracted: title="${metadata.title}", hasImage=${!!metadata.image}`)

    let thumbnailPath: string | null = null
    if (metadata.image) {
      const attachmentsDir = getItemAttachmentsDir(itemId)
      const imageName = await downloadImage(metadata.image, attachmentsDir)
      if (imageName) {
        thumbnailPath = `attachments/inbox/${itemId}/${imageName}`
        console.log(`[Metadata] Downloaded thumbnail: ${thumbnailPath}`)
      }
    }

    const now = new Date().toISOString()
    db.update(inboxItems)
      .set({
        title: metadata.title || url,
        content: metadata.description || null,
        thumbnailPath,
        processingStatus: 'complete',
        processingError: null,
        modifiedAt: now,
        metadata: {
          url,
          fetchStatus: 'complete',
          ...metadata
        }
      })
      .where(eq(inboxItems.id, itemId))
      .run()

    emitInboxEvent(InboxChannels.events.METADATA_COMPLETE, {
      id: itemId,
      metadata: {
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        thumbnailPath
      }
    })

    console.log(`[Metadata] Successfully updated item ${itemId}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Metadata] Error fetching metadata for ${url}:`, errorMessage)

    if (retryCount < 1) {
      console.log(`[Metadata] Scheduling retry for ${itemId} in ${METADATA_RETRY_DELAY}ms`)
      setTimeout(() => {
        fetchAndUpdateMetadata(itemId, url, retryCount + 1).catch(console.error)
      }, METADATA_RETRY_DELAY)
      return
    }

    try {
      db.update(inboxItems)
        .set({
          processingStatus: 'failed',
          processingError: errorMessage,
          modifiedAt: new Date().toISOString(),
          metadata: {
            url,
            fetchStatus: 'failed',
            error: errorMessage
          }
        })
        .where(eq(inboxItems.id, itemId))
        .run()

      emitInboxEvent(InboxChannels.events.PROCESSING_ERROR, {
        id: itemId,
        error: errorMessage
      })
    } catch (dbError) {
      console.error('[Metadata] Failed to update error status:', dbError)
    }
  }
}

export async function fetchAndUpdateSocialMetadata(
  itemId: string,
  url: string,
  retryCount = 0
): Promise<void> {
  let db: ReturnType<typeof requireDatabase>

  try {
    db = requireDatabase()
  } catch {
    console.warn('[Social] No database available, skipping social metadata fetch')
    return
  }

  const platform = detectSocialPlatform(url)
  console.log(`[Social] Fetching ${platform} metadata for ${url}`)

  try {
    db.update(inboxItems)
      .set({
        processingStatus: 'processing',
        modifiedAt: new Date().toISOString()
      })
      .where(eq(inboxItems.id, itemId))
      .run()

    const result = await extractSocialPost(url)

    if (result.success && result.metadata) {
      const metadata = result.metadata

      let title = metadata.authorName || metadata.authorHandle || url
      if (metadata.platform !== 'other') {
        const platformName = metadata.platform.charAt(0).toUpperCase() + metadata.platform.slice(1)
        if (metadata.authorHandle) {
          title = `${platformName} post by ${metadata.authorHandle}`
        } else if (metadata.authorName) {
          title = `${platformName} post by ${metadata.authorName}`
        } else {
          title = `${platformName} post`
        }
      }

      const content = metadata.postContent
        ? metadata.postContent.substring(0, 500) + (metadata.postContent.length > 500 ? '...' : '')
        : null

      const now = new Date().toISOString()
      db.update(inboxItems)
        .set({
          title,
          content,
          processingStatus: 'complete',
          processingError: null,
          modifiedAt: now,
          metadata: metadata
        })
        .where(eq(inboxItems.id, itemId))
        .run()

      emitInboxEvent(InboxChannels.events.METADATA_COMPLETE, {
        id: itemId,
        metadata
      })

      console.log(`[Social] Successfully updated social item ${itemId}: ${title}`)
    } else {
      console.log(
        `[Social] Social extraction failed, falling back to regular metadata: ${result.error}`
      )

      try {
        const regularMetadata = await fetchUrlMetadata(url)

        const fallbackSocial = createFallbackSocialMetadata(url, platform || 'other', result.error)

        const mergedMetadata: SocialMetadata = {
          ...fallbackSocial,
          postContent: regularMetadata.description || '',
          extractionStatus: 'partial'
        }

        const now = new Date().toISOString()
        db.update(inboxItems)
          .set({
            title: regularMetadata.title || url,
            content: regularMetadata.description || null,
            processingStatus: 'complete',
            processingError: null,
            modifiedAt: now,
            metadata: mergedMetadata
          })
          .where(eq(inboxItems.id, itemId))
          .run()

        emitInboxEvent(InboxChannels.events.METADATA_COMPLETE, {
          id: itemId,
          metadata: mergedMetadata
        })

        console.log(`[Social] Used fallback metadata for ${itemId}`)
      } catch (fallbackError) {
        throw new Error(
          `Social extraction failed: ${result.error}; Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`
        )
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Social] Error fetching social metadata for ${url}:`, errorMessage)

    if (retryCount < 1) {
      console.log(`[Social] Scheduling retry for ${itemId} in ${METADATA_RETRY_DELAY}ms`)
      setTimeout(() => {
        fetchAndUpdateSocialMetadata(itemId, url, retryCount + 1).catch(console.error)
      }, METADATA_RETRY_DELAY)
      return
    }

    try {
      const fallbackMetadata = createFallbackSocialMetadata(url, platform || 'other', errorMessage)

      db.update(inboxItems)
        .set({
          processingStatus: 'failed',
          processingError: errorMessage,
          modifiedAt: new Date().toISOString(),
          metadata: fallbackMetadata
        })
        .where(eq(inboxItems.id, itemId))
        .run()

      emitInboxEvent(InboxChannels.events.PROCESSING_ERROR, {
        id: itemId,
        operation: 'metadata',
        error: errorMessage
      })
    } catch (dbError) {
      console.error('[Social] Failed to update error status:', dbError)
    }
  }
}
