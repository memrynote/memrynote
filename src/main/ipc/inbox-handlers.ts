/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { ipcMain } from 'electron'
import { InboxChannels } from '@shared/ipc-channels'
import {
  handleCaptureText,
  handleCaptureLink,
  handleCaptureImage,
  handleCaptureVoice,
  stubCaptureClip,
  stubCapturePdf,
  handleRetryMetadata,
  handleRetryTranscription
} from './inbox-capture-handlers'
import {
  handleGet,
  handleUpdate,
  handleArchive,
  handleAddTag,
  handleRemoveTag,
  handleGetTags,
  handleUnarchive,
  handleDeletePermanent
} from './inbox-crud-handlers'
import {
  handleFile,
  handleGetSuggestions,
  handleTrackSuggestion,
  handleConvertToNote,
  handleLinkToNote,
  handleSnooze,
  handleUnsnooze,
  handleGetSnoozed,
  handleBulkSnooze,
  handleMarkViewed,
  handleBulkFile,
  handleBulkArchive,
  handleBulkTag,
  handleFileAllStale
} from './inbox-batch-handlers'
import {
  handleList,
  handleListArchived,
  handleGetStats,
  handleGetStaleThreshold,
  handleSetStaleThreshold,
  handleGetFilingHistory,
  stubGetPatterns
} from './inbox-query-handlers'

export function registerInboxHandlers(): void {
  // Capture
  ipcMain.handle(InboxChannels.invoke.CAPTURE_TEXT, (_, input) => handleCaptureText(input))
  ipcMain.handle(InboxChannels.invoke.CAPTURE_LINK, (_, input) => handleCaptureLink(input))
  ipcMain.handle(InboxChannels.invoke.CAPTURE_IMAGE, (_, input) => handleCaptureImage(input))
  ipcMain.handle(InboxChannels.invoke.CAPTURE_VOICE, (_, input) => handleCaptureVoice(input))
  ipcMain.handle(InboxChannels.invoke.CAPTURE_CLIP, () => stubCaptureClip())
  ipcMain.handle(InboxChannels.invoke.CAPTURE_PDF, () => stubCapturePdf())

  // CRUD
  ipcMain.handle(InboxChannels.invoke.GET, (_, id) => handleGet(id))
  ipcMain.handle(InboxChannels.invoke.LIST, (_, input) => handleList(input))
  ipcMain.handle(InboxChannels.invoke.UPDATE, (_, input) => handleUpdate(input))
  ipcMain.handle(InboxChannels.invoke.ARCHIVE, (_, id) => handleArchive(id))

  // Filing
  ipcMain.handle(InboxChannels.invoke.FILE, (_, input) => handleFile(input))
  ipcMain.handle(InboxChannels.invoke.GET_SUGGESTIONS, (_, itemId) => handleGetSuggestions(itemId))
  ipcMain.handle(
    InboxChannels.invoke.TRACK_SUGGESTION,
    (_, itemId, itemType, suggestedTo, actualTo, confidence, suggestedTags, actualTags) =>
      handleTrackSuggestion(
        itemId,
        itemType,
        suggestedTo,
        actualTo,
        confidence,
        suggestedTags,
        actualTags
      )
  )
  ipcMain.handle(InboxChannels.invoke.CONVERT_TO_NOTE, (_, itemId) => handleConvertToNote(itemId))
  ipcMain.handle(InboxChannels.invoke.LINK_TO_NOTE, (_, itemId, noteId, tags) =>
    handleLinkToNote(itemId, noteId, tags || [])
  )

  // Tags
  ipcMain.handle(InboxChannels.invoke.ADD_TAG, (_, itemId, tag) => handleAddTag(itemId, tag))
  ipcMain.handle(InboxChannels.invoke.REMOVE_TAG, (_, itemId, tag) => handleRemoveTag(itemId, tag))
  ipcMain.handle(InboxChannels.invoke.GET_TAGS, () => handleGetTags())

  // Snooze
  ipcMain.handle(InboxChannels.invoke.SNOOZE, (_, input) => handleSnooze(input))
  ipcMain.handle(InboxChannels.invoke.UNSNOOZE, (_, itemId) => handleUnsnooze(itemId))
  ipcMain.handle(InboxChannels.invoke.GET_SNOOZED, () => handleGetSnoozed())
  ipcMain.handle(InboxChannels.invoke.BULK_SNOOZE, (_, input) => handleBulkSnooze(input))

  // Viewed (reminder items)
  ipcMain.handle(InboxChannels.invoke.MARK_VIEWED, (_, itemId) => handleMarkViewed(itemId))

  // Bulk
  ipcMain.handle(InboxChannels.invoke.BULK_FILE, (_, input) => handleBulkFile(input))
  ipcMain.handle(InboxChannels.invoke.BULK_ARCHIVE, (_, input) => handleBulkArchive(input))
  ipcMain.handle(InboxChannels.invoke.BULK_TAG, (_, input) => handleBulkTag(input))
  ipcMain.handle(InboxChannels.invoke.FILE_ALL_STALE, () => handleFileAllStale())

  // Transcription
  ipcMain.handle(InboxChannels.invoke.RETRY_TRANSCRIPTION, (_, itemId) =>
    handleRetryTranscription(itemId)
  )

  // Metadata
  ipcMain.handle(InboxChannels.invoke.RETRY_METADATA, (_, id) => handleRetryMetadata(id))

  // Stats
  ipcMain.handle(InboxChannels.invoke.GET_STATS, () => handleGetStats())
  ipcMain.handle(InboxChannels.invoke.GET_PATTERNS, () => stubGetPatterns())

  // Settings
  ipcMain.handle(InboxChannels.invoke.GET_STALE_THRESHOLD, () => handleGetStaleThreshold())
  ipcMain.handle(InboxChannels.invoke.SET_STALE_THRESHOLD, (_, days) =>
    handleSetStaleThreshold(days)
  )

  // Archived items
  ipcMain.handle(InboxChannels.invoke.LIST_ARCHIVED, (_, input) => handleListArchived(input))
  ipcMain.handle(InboxChannels.invoke.UNARCHIVE, (_, id) => handleUnarchive(id))
  ipcMain.handle(InboxChannels.invoke.DELETE_PERMANENT, (_, id) => handleDeletePermanent(id))

  // Filing history
  ipcMain.handle(InboxChannels.invoke.GET_FILING_HISTORY, (_, input) =>
    handleGetFilingHistory(input)
  )

  console.log('[IPC] Inbox handlers registered')
}

export function unregisterInboxHandlers(): void {
  // Capture
  ipcMain.removeHandler(InboxChannels.invoke.CAPTURE_TEXT)
  ipcMain.removeHandler(InboxChannels.invoke.CAPTURE_LINK)
  ipcMain.removeHandler(InboxChannels.invoke.CAPTURE_IMAGE)
  ipcMain.removeHandler(InboxChannels.invoke.CAPTURE_VOICE)
  ipcMain.removeHandler(InboxChannels.invoke.CAPTURE_CLIP)
  ipcMain.removeHandler(InboxChannels.invoke.CAPTURE_PDF)

  // CRUD
  ipcMain.removeHandler(InboxChannels.invoke.GET)
  ipcMain.removeHandler(InboxChannels.invoke.LIST)
  ipcMain.removeHandler(InboxChannels.invoke.UPDATE)
  ipcMain.removeHandler(InboxChannels.invoke.ARCHIVE)

  // Filing
  ipcMain.removeHandler(InboxChannels.invoke.FILE)
  ipcMain.removeHandler(InboxChannels.invoke.GET_SUGGESTIONS)
  ipcMain.removeHandler(InboxChannels.invoke.TRACK_SUGGESTION)
  ipcMain.removeHandler(InboxChannels.invoke.CONVERT_TO_NOTE)
  ipcMain.removeHandler(InboxChannels.invoke.LINK_TO_NOTE)

  // Tags
  ipcMain.removeHandler(InboxChannels.invoke.ADD_TAG)
  ipcMain.removeHandler(InboxChannels.invoke.REMOVE_TAG)
  ipcMain.removeHandler(InboxChannels.invoke.GET_TAGS)

  // Snooze
  ipcMain.removeHandler(InboxChannels.invoke.SNOOZE)
  ipcMain.removeHandler(InboxChannels.invoke.UNSNOOZE)
  ipcMain.removeHandler(InboxChannels.invoke.GET_SNOOZED)
  ipcMain.removeHandler(InboxChannels.invoke.BULK_SNOOZE)

  // Viewed
  ipcMain.removeHandler(InboxChannels.invoke.MARK_VIEWED)

  // Bulk
  ipcMain.removeHandler(InboxChannels.invoke.BULK_FILE)
  ipcMain.removeHandler(InboxChannels.invoke.BULK_ARCHIVE)
  ipcMain.removeHandler(InboxChannels.invoke.BULK_TAG)
  ipcMain.removeHandler(InboxChannels.invoke.FILE_ALL_STALE)

  // Transcription
  ipcMain.removeHandler(InboxChannels.invoke.RETRY_TRANSCRIPTION)

  // Metadata
  ipcMain.removeHandler(InboxChannels.invoke.RETRY_METADATA)

  // Stats
  ipcMain.removeHandler(InboxChannels.invoke.GET_STATS)
  ipcMain.removeHandler(InboxChannels.invoke.GET_PATTERNS)

  // Settings
  ipcMain.removeHandler(InboxChannels.invoke.GET_STALE_THRESHOLD)
  ipcMain.removeHandler(InboxChannels.invoke.SET_STALE_THRESHOLD)

  // Archived items
  ipcMain.removeHandler(InboxChannels.invoke.LIST_ARCHIVED)
  ipcMain.removeHandler(InboxChannels.invoke.UNARCHIVE)
  ipcMain.removeHandler(InboxChannels.invoke.DELETE_PERMANENT)

  // Filing history
  ipcMain.removeHandler(InboxChannels.invoke.GET_FILING_HISTORY)

  console.log('[IPC] Inbox handlers unregistered')
}
