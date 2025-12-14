// ============================================================================
// SAMPLE INBOX DATA
// ============================================================================
// Test data with at least 2 items of each content type for development.

import type {
  InboxItem,
  LinkItem,
  NoteItem,
  ImageItem,
  VoiceItem,
  PdfItem,
  WebclipItem,
  FileItem,
  VideoItem,
} from './inbox-types'

// ============================================================================
// SAMPLE LINK ITEMS
// ============================================================================

const linkItems: LinkItem[] = [
  {
    id: 'link-001',
    type: 'link',
    title: 'How to Build a Second Brain — Forte Labs',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    source: 'browser-ext',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    url: 'https://fortelabs.com/blog/basboverview/',
    domain: 'fortelabs.com',
    favicon: 'https://fortelabs.com/favicon.ico',
    heroImage: 'https://fortelabs.com/wp-content/uploads/2019/02/basb-hero.jpg',
    excerpt: 'The PARA method helps you organize information by actionability. Instead of organizing by topic, you organize by how actionable each piece of information is...',
  },
  {
    id: 'link-002',
    type: 'link',
    title: 'The Zettelkasten Method: A Complete Guide',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    source: 'paste',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    url: 'https://zettelkasten.de/posts/overview/',
    domain: 'zettelkasten.de',
    favicon: 'https://zettelkasten.de/favicon.ico',
    heroImage: null,
    excerpt: 'A Zettelkasten is a personal tool for thinking and writing. It has hypertextual features to make a web of thought possible.',
  },
  {
    id: 'link-003',
    type: 'link',
    title: 'Linking Your Thinking — Knowledge Management',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    source: 'browser-ext',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    url: 'https://linkingyourthinking.com/',
    domain: 'linkingyourthinking.com',
    favicon: null,
    heroImage: 'https://linkingyourthinking.com/og-image.jpg',
    excerpt: 'LYT is a framework for building a personal knowledge management system that works with how your brain naturally creates connections.',
  },
]

// ============================================================================
// SAMPLE NOTE ITEMS
// ============================================================================

const noteItems: NoteItem[] = [
  {
    id: 'note-001',
    type: 'note',
    title: 'Meeting notes: Q4 planning session',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    source: 'quick-capture',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    content: `Discussed roadmap priorities. Key decisions:
1) Launch inbox feature by end of month
2) Defer AI suggestions to v2
3) Focus on core capture experience first

Action items:
- Sarah: Design review by Friday
- Mike: API integration specs
- Team: Daily standups at 10am`,
    wordCount: 47,
    preview: 'Discussed roadmap priorities. Key decisions: 1) Launch inbox feature by end of month...',
  },
  {
    id: 'note-002',
    type: 'note',
    title: 'Book idea: Digital minimalism for knowledge workers',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    source: 'voice-record',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    content: `Idea for a book about how knowledge workers can be more intentional about their digital tools. Focus on:
- The paradox of productivity tools making us less productive
- Why we need fewer apps, not more
- Building a personal stack that actually serves you`,
    wordCount: 51,
    preview: 'Idea for a book about how knowledge workers can be more intentional about their digital tools...',
  },
]

// ============================================================================
// SAMPLE IMAGE ITEMS
// ============================================================================

const imageItems: ImageItem[] = [
  {
    id: 'image-001',
    type: 'image',
    title: 'whiteboard-sketch.png',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    source: 'drag-drop',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    imageUrl: '/samples/whiteboard-sketch.png',
    dimensions: { width: 1920, height: 1080 },
    fileSize: '2.4 MB',
    caption: null,
    thumbnailUrl: '/samples/whiteboard-sketch-thumb.png',
  },
  {
    id: 'image-002',
    type: 'image',
    title: 'design-inspiration-ui.jpg',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    source: 'paste',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    imageUrl: '/samples/design-inspiration.jpg',
    dimensions: { width: 2400, height: 1600 },
    fileSize: '1.8 MB',
    caption: 'Beautiful sidebar design from Dribbble',
    thumbnailUrl: '/samples/design-inspiration-thumb.jpg',
  },
]

// ============================================================================
// SAMPLE VOICE ITEMS
// ============================================================================

const voiceItems: VoiceItem[] = [
  {
    id: 'voice-001',
    type: 'voice',
    title: 'Voice memo — Project ideas',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    source: 'voice-record',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    audioUrl: '/samples/voice-memo-001.m4a',
    duration: 154, // 2:34
    waveformData: [0.2, 0.3, 0.5, 0.7, 0.9, 0.7, 0.5, 0.3, 0.2, 0.3, 0.5, 0.8, 0.9, 0.8, 0.5, 0.3],
    transcription: "I was thinking about the new feature we're building. The key insight is that users need to capture first and organize later. We should make the capture experience as frictionless as possible.",
    isAutoTranscribed: true,
  },
  {
    id: 'voice-002',
    type: 'voice',
    title: 'Quick thought on API design',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    source: 'voice-record',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    audioUrl: '/samples/voice-memo-002.m4a',
    duration: 45, // 0:45
    waveformData: [0.1, 0.4, 0.6, 0.8, 0.6, 0.4, 0.3, 0.5, 0.7, 0.9, 0.7, 0.4],
    transcription: null,
    isAutoTranscribed: false,
  },
]

// ============================================================================
// SAMPLE PDF ITEMS
// ============================================================================

const pdfItems: PdfItem[] = [
  {
    id: 'pdf-001',
    type: 'pdf',
    title: 'Q3-Financial-Report.pdf',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    source: 'drag-drop',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    fileUrl: '/samples/q3-report.pdf',
    pageCount: 12,
    fileSize: '3.2 MB',
    thumbnailUrl: '/samples/q3-report-thumb.png',
    textPreview: 'Quarterly Revenue Summary. Total Revenue: $2.4M with a 15% increase from Q2...',
  },
  {
    id: 'pdf-002',
    type: 'pdf',
    title: 'Research-Paper-Knowledge-Graphs.pdf',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    source: 'browser-ext',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    fileUrl: '/samples/research-paper.pdf',
    pageCount: 28,
    fileSize: '1.5 MB',
    thumbnailUrl: '/samples/research-paper-thumb.png',
    textPreview: 'Abstract: This paper explores the application of knowledge graphs in personal knowledge management systems...',
  },
]

// ============================================================================
// SAMPLE WEBCLIP ITEMS
// ============================================================================

const webclipItems: WebclipItem[] = [
  {
    id: 'webclip-001',
    type: 'webclip',
    title: 'Clipped from: The Future of PKM',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    source: 'browser-ext',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    sourceUrl: 'https://medium.com/@author/the-future-of-pkm',
    domain: 'medium.com',
    highlights: [
      {
        id: 'hl-001',
        text: "The key insight is that personal knowledge management isn't about storage—it's about retrieval and connection.",
        note: 'This is exactly what we should focus on',
      },
      {
        id: 'hl-002',
        text: 'AI will transform how we interact with our notes, making serendipitous connections visible.',
        note: null,
      },
    ],
  },
  {
    id: 'webclip-002',
    type: 'webclip',
    title: 'Clipped from: Building in Public',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    source: 'browser-ext',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    sourceUrl: 'https://twitter.com/naval/status/123456789',
    domain: 'twitter.com',
    highlights: [
      {
        id: 'hl-003',
        text: 'Building in public creates accountability and attracts collaborators who share your vision.',
        note: null,
      },
    ],
  },
]

// ============================================================================
// SAMPLE FILE ITEMS
// ============================================================================

const fileItems: FileItem[] = [
  {
    id: 'file-001',
    type: 'file',
    title: 'Project-Proposal-v2.docx',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    source: 'drag-drop',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    fileUrl: '/samples/project-proposal.docx',
    fileName: 'Project-Proposal-v2.docx',
    extension: 'docx',
    fileSize: '245 KB',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    id: 'file-002',
    type: 'file',
    title: 'Budget-2024.xlsx',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    source: 'drag-drop',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    fileUrl: '/samples/budget-2024.xlsx',
    fileName: 'Budget-2024.xlsx',
    extension: 'xlsx',
    fileSize: '128 KB',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
]

// ============================================================================
// SAMPLE VIDEO ITEMS
// ============================================================================

const videoItems: VideoItem[] = [
  {
    id: 'video-001',
    type: 'video',
    title: 'How I Take Smart Notes — YouTube',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    source: 'paste',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    videoUrl: 'https://youtube.com/watch?v=abc123',
    thumbnailUrl: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg',
    duration: 847, // 14:07
    videoSource: 'youtube',
  },
  {
    id: 'video-002',
    type: 'video',
    title: 'Product Demo Recording.mp4',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    source: 'drag-drop',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    videoUrl: '/samples/product-demo.mp4',
    thumbnailUrl: '/samples/product-demo-thumb.jpg',
    duration: 180, // 3:00
    videoSource: 'local',
  },
]

// ============================================================================
// STALE ITEMS (older than 7 days)
// ============================================================================

const staleItems: InboxItem[] = [
  {
    id: 'stale-001',
    type: 'link',
    title: 'Old article from last month',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    source: 'browser-ext',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    url: 'https://example.com/old-article',
    domain: 'example.com',
    favicon: null,
    heroImage: null,
    excerpt: 'An old article that has been sitting in the inbox...',
  } as LinkItem,
  {
    id: 'stale-002',
    type: 'note',
    title: 'Random note',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    source: 'quick-capture',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    content: 'Some random thought I had...',
    wordCount: 5,
    preview: 'Some random thought I had...',
  } as NoteItem,
  {
    id: 'stale-003',
    type: 'image',
    title: 'old-screenshot.png',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    source: 'paste',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    imageUrl: '/samples/old-screenshot.png',
    dimensions: { width: 1280, height: 720 },
    fileSize: '890 KB',
    caption: null,
    thumbnailUrl: null,
  } as ImageItem,
  {
    id: 'stale-004',
    type: 'voice',
    title: 'Old voice memo',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    source: 'voice-record',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: null,
    snoozedAt: null,
    audioUrl: '/samples/old-voice.m4a',
    duration: 67,
    waveformData: [0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3],
    transcription: null,
    isAutoTranscribed: false,
  } as VoiceItem,
]

// ============================================================================
// SNOOZED ITEMS
// ============================================================================

const snoozedItems: InboxItem[] = [
  {
    id: 'snoozed-001',
    type: 'link',
    title: 'Design article — snoozed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    source: 'browser-ext',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: new Date(Date.now() + 6 * 60 * 60 * 1000), // Returns in 6 hours
    snoozedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    url: 'https://example.com/design-article',
    domain: 'example.com',
    favicon: null,
    heroImage: null,
    excerpt: 'A design article to read later...',
  } as LinkItem,
  {
    id: 'snoozed-002',
    type: 'note',
    title: 'Meeting notes — snoozed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    source: 'quick-capture',
    tagIds: [],
    folderId: null,
    filedAt: null,
    snoozedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Returns tomorrow
    snoozedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    content: 'Follow up on the meeting notes...',
    wordCount: 6,
    preview: 'Follow up on the meeting notes...',
  } as NoteItem,
]

// ============================================================================
// COMBINED SAMPLE DATA
// ============================================================================

export const sampleInboxItems: InboxItem[] = [
  ...linkItems,
  ...noteItems,
  ...imageItems,
  ...voiceItems,
  ...pdfItems,
  ...webclipItems,
  ...fileItems,
  ...videoItems,
  ...staleItems,
  ...snoozedItems,
]

// ============================================================================
// STATS HELPERS
// ============================================================================

export const getSampleStats = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayItems = sampleInboxItems.filter(item => {
    const itemDate = new Date(item.createdAt)
    itemDate.setHours(0, 0, 0, 0)
    return itemDate.getTime() === today.getTime()
  })

  const snoozed = sampleInboxItems.filter(item =>
    item.snoozedUntil && item.snoozedUntil > new Date()
  )

  return {
    total: sampleInboxItems.length,
    todayCount: todayItems.length,
    snoozedCount: snoozed.length,
  }
}
