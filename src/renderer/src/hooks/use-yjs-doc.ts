/**
 * Yjs Document Management Hook
 *
 * Manages Y.Doc lifecycle and provider connection for a given noteId.
 * Handles creation, synchronization, and cleanup of Yjs documents.
 *
 * T140: Integrate Yjs with BlockNote collaboration
 *
 * @module hooks/use-yjs-doc
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import * as Y from 'yjs'
import { YjsIPCProvider, createYjsIPCProvider } from '../sync/yjs-ipc-provider'

interface UseYjsDocResult {
  doc: Y.Doc | null
  provider: YjsIPCProvider | null
  synced: boolean
  error: Error | null
  retry: () => void
}

export function useYjsDoc(noteId: string | null): UseYjsDocResult {
  const [doc, setDoc] = useState<Y.Doc | null>(null)
  const [provider, setProvider] = useState<YjsIPCProvider | null>(null)
  const [synced, setSynced] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const providerRef = useRef<YjsIPCProvider | null>(null)
  const docRef = useRef<Y.Doc | null>(null)

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1)
  }, [])

  useEffect(() => {
    if (!noteId) {
      setDoc(null)
      setProvider(null)
      setSynced(false)
      setError(null)
      return
    }

    const ydoc = new Y.Doc({ guid: noteId })
    const yjsProvider = createYjsIPCProvider(noteId, ydoc)

    docRef.current = ydoc
    providerRef.current = yjsProvider

    const handleSynced = (): void => {
      setSynced(true)
    }

    const handleError = (err: Error): void => {
      console.error('[useYjsDoc] Connection error:', err)
      setError(err)
    }

    yjsProvider.on('synced', handleSynced)
    yjsProvider.on('connection-error', handleError)

    setDoc(ydoc)
    setProvider(yjsProvider)
    setError(null)
    setSynced(false)

    yjsProvider.connect().catch(handleError)

    return () => {
      yjsProvider.off('synced', handleSynced)
      yjsProvider.off('connection-error', handleError)
      yjsProvider.destroy()
      ydoc.destroy()
      providerRef.current = null
      docRef.current = null
    }
  }, [noteId, retryCount])

  return { doc, provider, synced, error, retry }
}
