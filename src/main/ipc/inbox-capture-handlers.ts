/* eslint-disable @typescript-eslint/require-await */

import { InboxChannels } from '@shared/ipc-channels'
import {
  CaptureTextSchema,
  CaptureLinkSchema,
  CaptureImageSchema,
  type CaptureResponse,
  type ImageMetadata
} from '@shared/contracts/inbox-api'
import sharp from 'sharp'
import { generateId } from '../lib/id'
import { inboxItems, inboxItemTags } from '@shared/db/schema/inbox'
import { eq } from 'drizzle-orm'
import {
  storeInboxAttachment,
  storeThumbnail,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES
} from '../inbox/attachments'
import { detectSocialPlatform, isSocialPost } from '../inbox/social'
import { captureVoice } from '../inbox/capture'
import { retryTranscription } from '../inbox/transcription'
import {
  emitInboxEvent,
  requireDatabase,
  getItemTags,
  toInboxItem,
  toListItem
} from './inbox-shared'
import { fetchAndUpdateMetadata, fetchAndUpdateSocialMetadata } from './inbox-metadata'

function getInboxTypeFromMime(mimeType: string): 'image' | 'voice' | 'video' | 'pdf' {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image'
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'voice'
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video'
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'pdf'
  return 'image'
}

export async function handleCaptureText(input: unknown): Promise<CaptureResponse> {
  try {
    const parsed = CaptureTextSchema.parse(input)
    const db = requireDatabase()

    const id = generateId()
    const now = new Date().toISOString()

    db.insert(inboxItems)
      .values({
        id,
        type: 'note',
        title:
          parsed.title ||
          parsed.content.substring(0, 50) + (parsed.content.length > 50 ? '...' : ''),
        content: parsed.content,
        createdAt: now,
        modifiedAt: now,
        processingStatus: 'complete'
      })
      .run()

    if (parsed.tags && parsed.tags.length > 0) {
      for (const tag of parsed.tags) {
        db.insert(inboxItemTags)
          .values({
            id: generateId(),
            itemId: id,
            tag,
            createdAt: now
          })
          .run()
      }
    }

    const created = db.select().from(inboxItems).where(eq(inboxItems.id, id)).get()
    if (!created) {
      return { success: false, item: null, error: 'Failed to create item' }
    }

    const tags = getItemTags(db, id)
    const item = toInboxItem(created, tags)

    emitInboxEvent(InboxChannels.events.CAPTURED, { item: toListItem(created, tags) })

    return { success: true, item }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, item: null, error: message }
  }
}

export async function handleCaptureLink(input: unknown): Promise<CaptureResponse> {
  try {
    const parsed = CaptureLinkSchema.parse(input)
    const db = requireDatabase()

    const id = generateId()
    const now = new Date().toISOString()

    const platform = detectSocialPlatform(parsed.url)
    const isSocial = platform !== null && isSocialPost(parsed.url)
    const itemType = isSocial ? 'social' : 'link'

    console.log(
      `[Capture] URL detected as ${itemType}${platform ? ` (${platform})` : ''}: ${parsed.url}`
    )

    db.insert(inboxItems)
      .values({
        id,
        type: itemType,
        title: parsed.url,
        content: null,
        sourceUrl: parsed.url,
        createdAt: now,
        modifiedAt: now,
        processingStatus: 'pending',
        metadata: isSocial
          ? {
              platform: platform || 'other',
              postUrl: parsed.url,
              authorName: '',
              authorHandle: '',
              postContent: '',
              mediaUrls: [],
              extractionStatus: 'pending' as const
            }
          : {
              url: parsed.url,
              fetchStatus: 'pending'
            }
      })
      .run()

    if (parsed.tags && parsed.tags.length > 0) {
      for (const tag of parsed.tags) {
        db.insert(inboxItemTags)
          .values({
            id: generateId(),
            itemId: id,
            tag,
            createdAt: now
          })
          .run()
      }
    }

    const created = db.select().from(inboxItems).where(eq(inboxItems.id, id)).get()
    if (!created) {
      return { success: false, item: null, error: 'Failed to create item' }
    }

    const tags = getItemTags(db, id)
    const item = toInboxItem(created, tags)

    emitInboxEvent(InboxChannels.events.CAPTURED, { item: toListItem(created, tags) })

    setImmediate(() => {
      if (isSocial) {
        fetchAndUpdateSocialMetadata(id, parsed.url).catch((err) => {
          console.error('[Inbox] Background social metadata fetch error:', err)
        })
      } else {
        fetchAndUpdateMetadata(id, parsed.url).catch((err) => {
          console.error('[Inbox] Background metadata fetch error:', err)
        })
      }
    })

    return { success: true, item }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, item: null, error: message }
  }
}

export async function handleCaptureImage(input: unknown): Promise<CaptureResponse> {
  try {
    const parsed = CaptureImageSchema.parse(input)
    const db = requireDatabase()

    const id = generateId()
    const now = new Date().toISOString()

    const inboxType = getInboxTypeFromMime(parsed.mimeType)
    const isImage = ALLOWED_IMAGE_TYPES.includes(parsed.mimeType)

    let fileBuffer: Buffer
    if (Buffer.isBuffer(parsed.data)) {
      fileBuffer = parsed.data
    } else if (parsed.data instanceof Uint8Array) {
      fileBuffer = Buffer.from(parsed.data)
    } else if (parsed.data instanceof ArrayBuffer) {
      fileBuffer = Buffer.from(parsed.data)
    } else if (typeof parsed.data === 'object' && parsed.data !== null) {
      const data = parsed.data as Record<string, unknown>
      if (data.type === 'Buffer' && Array.isArray(data.data)) {
        fileBuffer = Buffer.from(data.data as number[])
      } else {
        const values = Object.values(data).filter((v): v is number => typeof v === 'number')
        if (values.length === 0) {
          return {
            success: false,
            item: null,
            error: 'Invalid file data format: empty or non-numeric data'
          }
        }
        fileBuffer = Buffer.from(values)
      }
    } else {
      return {
        success: false,
        item: null,
        error: 'Invalid file data format'
      }
    }

    if (fileBuffer.length === 0) {
      return {
        success: false,
        item: null,
        error: 'Empty file data'
      }
    }

    const storeResult = await storeInboxAttachment(id, fileBuffer, parsed.filename, parsed.mimeType)

    if (!storeResult.success) {
      return {
        success: false,
        item: null,
        error: storeResult.error || 'Failed to store file'
      }
    }

    let thumbnailPath: string | null = null
    let itemMetadata: Record<string, unknown> = {
      originalFilename: parsed.filename,
      fileSize: fileBuffer.length,
      mimeType: parsed.mimeType
    }

    if (isImage) {
      try {
        const metadata = await sharp(fileBuffer).metadata()

        if (metadata.width && metadata.height) {
          const imageMetadata: ImageMetadata = {
            originalFilename: parsed.filename,
            format: metadata.format || 'unknown',
            width: metadata.width,
            height: metadata.height,
            fileSize: fileBuffer.length,
            hasExif: !!(metadata.exif || metadata.icc)
          }
          itemMetadata = imageMetadata as unknown as Record<string, unknown>

          try {
            const thumbnailBuffer = await sharp(fileBuffer)
              .resize(400, 400, {
                fit: 'inside',
                withoutEnlargement: true
              })
              .jpeg({ quality: 80 })
              .toBuffer()

            const thumbnailResult = await storeThumbnail(id, thumbnailBuffer, 'jpg')
            if (thumbnailResult.success && thumbnailResult.thumbnailPath) {
              thumbnailPath = thumbnailResult.thumbnailPath
            }
          } catch (err) {
            console.warn('[Attachment] Failed to generate thumbnail:', err)
          }
        }
      } catch (err) {
        console.warn('[Attachment] Failed to read image metadata:', err)
      }
    }

    db.insert(inboxItems)
      .values({
        id,
        type: inboxType,
        title: parsed.filename.replace(/\.[^.]+$/, ''),
        content: null,
        createdAt: now,
        modifiedAt: now,
        processingStatus: 'complete',
        attachmentPath: storeResult.path || null,
        thumbnailPath,
        metadata: itemMetadata
      })
      .run()

    if (parsed.tags && parsed.tags.length > 0) {
      for (const tag of parsed.tags) {
        db.insert(inboxItemTags)
          .values({
            id: generateId(),
            itemId: id,
            tag,
            createdAt: now
          })
          .run()
      }
    }

    const created = db.select().from(inboxItems).where(eq(inboxItems.id, id)).get()
    if (!created) {
      return { success: false, item: null, error: 'Failed to create item' }
    }

    const tags = getItemTags(db, id)
    const item = toInboxItem(created, tags)

    emitInboxEvent(InboxChannels.events.CAPTURED, { item: toListItem(created, tags) })

    console.log(
      `[Attachment] Captured ${inboxType}: ${parsed.filename} (${fileBuffer.length} bytes)`
    )

    return { success: true, item }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Attachment] Capture failed:', message)
    return { success: false, item: null, error: message }
  }
}

export async function handleCaptureVoice(input: unknown): Promise<CaptureResponse> {
  try {
    if (!input || typeof input !== 'object') {
      return { success: false, item: null, error: 'Invalid voice capture input' }
    }

    const rawInput = input as Record<string, unknown>

    let audioBuffer: Buffer
    const rawData = rawInput.data

    if (Buffer.isBuffer(rawData)) {
      audioBuffer = rawData
    } else if (rawData instanceof Uint8Array) {
      audioBuffer = Buffer.from(rawData)
    } else if (rawData instanceof ArrayBuffer) {
      audioBuffer = Buffer.from(rawData)
    } else if (typeof rawData === 'object' && rawData !== null) {
      const data = rawData as Record<string, unknown>
      if (data.type === 'Buffer' && Array.isArray(data.data)) {
        audioBuffer = Buffer.from(data.data as number[])
      } else {
        const values = Object.values(data).filter((v): v is number => typeof v === 'number')
        if (values.length === 0) {
          return {
            success: false,
            item: null,
            error: 'Invalid audio data format: empty or non-numeric data'
          }
        }
        audioBuffer = Buffer.from(values)
      }
    } else {
      return { success: false, item: null, error: 'Invalid audio data format' }
    }

    if (audioBuffer.length === 0) {
      return { success: false, item: null, error: 'Empty audio data' }
    }

    return await captureVoice({
      data: audioBuffer,
      duration: rawInput.duration as number,
      format: rawInput.format as 'webm' | 'mp3' | 'wav',
      transcribe: rawInput.transcribe as boolean | undefined,
      tags: rawInput.tags as string[] | undefined
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Voice] Capture failed:', message)
    return { success: false, item: null, error: message }
  }
}

export async function stubCaptureClip(): Promise<CaptureResponse> {
  return { success: false, item: null, error: 'Not implemented yet' }
}

export async function stubCapturePdf(): Promise<CaptureResponse> {
  return { success: false, item: null, error: 'Not implemented yet' }
}

export async function handleRetryMetadata(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = requireDatabase()

    const item = db.select().from(inboxItems).where(eq(inboxItems.id, itemId)).get()
    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    if (item.type !== 'link') {
      return { success: false, error: 'Item is not a link' }
    }

    if (!item.sourceUrl) {
      return { success: false, error: 'Item has no source URL' }
    }

    db.update(inboxItems)
      .set({
        processingStatus: 'pending',
        processingError: null,
        modifiedAt: new Date().toISOString()
      })
      .where(eq(inboxItems.id, itemId))
      .run()

    setImmediate(() => {
      fetchAndUpdateMetadata(itemId, item.sourceUrl!, 0).catch((err) => {
        console.error('[Inbox] Retry metadata fetch error:', err)
      })
    })

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function handleRetryTranscription(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await retryTranscription(itemId)
    return {
      success: result.success,
      error: result.error
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Transcription] Retry failed:', message)
    return { success: false, error: message }
  }
}
