import type { NoteFrontmatter } from '../vault/frontmatter'
import type * as Y from 'yjs'

const SYNCABLE_META_KEYS = ['title', 'tags', 'aliases', 'emoji', 'properties'] as const

export function mergeFrontmatterFromCrdt(
  metaMap: Y.Map<unknown>,
  fileFrontmatter: NoteFrontmatter
): NoteFrontmatter {
  const result: NoteFrontmatter = { ...fileFrontmatter }

  for (const key of SYNCABLE_META_KEYS) {
    const value = metaMap.get(key)
    if (value === null) {
      delete result[key]
    } else if (value !== undefined) {
      ;(result as Record<string, unknown>)[key] = value
    }
  }

  result.id = fileFrontmatter.id
  result.created = fileFrontmatter.created
  result.modified = new Date().toISOString()

  return result
}


export interface CrdtMetaChanges {
  title?: string
  tags?: string[]
  aliases?: string[]
  emoji?: string | null
  properties?: Record<string, unknown>
}

export async function updateCrdtMeta(noteId: string, changes: CrdtMetaChanges): Promise<void> {
  const { getCrdtProvider } = await import('./crdt-provider')
  const crdtProvider = getCrdtProvider()

  if (!crdtProvider) {
    return
  }

  const doc = await crdtProvider.getOrCreateDoc(noteId)
  const metaMap = doc.getMap('meta')

  doc.transact(() => {
    for (const key of SYNCABLE_META_KEYS) {
      if (key in changes) {
        const value = changes[key as keyof CrdtMetaChanges]
        if (value !== undefined) {
          metaMap.set(key, value)
        }
      }
    }
  }, 'internal')

  crdtProvider.markCrdtWrite(noteId)
}
