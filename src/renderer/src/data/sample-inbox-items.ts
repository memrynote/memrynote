import type { InboxItem } from "@/types"

// Helper to create dates relative to today
const createDate = (daysAgo: number, hours: number, minutes: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hours, minutes, 0, 0)
  return date
}

export const sampleInboxItems: InboxItem[] = [
  // TODAY items
  {
    id: "1",
    type: "link",
    title: "The Design of Everyday Things",
    timestamp: createDate(0, 14, 34), // today at 2:34 PM
    url: "https://nngroup.com/articles/design-everyday-things",
    previewContent: {
      excerpt: "Don Norman's The Design of Everyday Things is a powerful primer on how—and why—some products satisfy customers while others only frustrate them. The book explores the psychology behind good and bad design through examples ranging from doors to nuclear power plants.",
      heroImage: null,
      highlightedText: "Good design is actually harder to notice than bad design, in part because good designs fit our needs so well that the design is invisible.",
    },
  },
  {
    id: "2",
    type: "link",
    title: "Atomic Design by Brad Frost",
    timestamp: createDate(0, 14, 12), // today at 2:12 PM
    url: "https://atomicdesign.bradfrost.com",
    previewContent: {
      excerpt: "Atomic design is a methodology for creating design systems. There are five distinct levels in atomic design: Atoms, Molecules, Organisms, Templates, and Pages.",
      heroImage: null,
      highlightedText: "We're not designing pages, we're designing systems of components.",
    },
  },
  {
    id: "3",
    type: "note",
    title: "API architecture question for Monday's meeting",
    timestamp: createDate(0, 13, 45), // today at 1:45 PM
    content: "Need to discuss whether we should use REST or GraphQL for the new endpoints. Also consider rate limiting strategy.",
    previewContent: {
      fullText: "Need to discuss whether we should use REST or GraphQL for the new endpoints.\n\nConsiderations:\n- Team familiarity (more REST experience)\n- Client needs (mobile app wants flexible queries)\n- Caching requirements\n- Rate limiting strategy\n\nAlso consider rate limiting strategy and how it affects our pricing tiers.\n\nAction items:\n1. Research GraphQL caching solutions\n2. Talk to mobile team about their query patterns\n3. Review current REST API usage metrics",
    },
  },
  {
    id: "4",
    type: "voice",
    title: "Voice memo",
    timestamp: createDate(0, 11, 20), // today at 11:20 AM
    duration: 34,
    previewContent: {
      audioUrl: "/audio/memo-004.webm",
      transcription: "Remember to ask about the API architecture in Monday's meeting. Also need to follow up on the design token naming convention discussion. Sarah mentioned she has some research on semantic naming that could be useful.",
      transcriptionAuto: true,
    },
  },

  // YESTERDAY items
  {
    id: "5",
    type: "link",
    title: "Design Tokens W3C Spec",
    timestamp: createDate(1, 18, 45), // yesterday at 6:45 PM
    url: "https://design-tokens.github.io/community-group/format/",
    previewContent: {
      excerpt: "The Design Tokens Format Module defines a standard file format for expressing design tokens, regardless of their application or tooling.",
      heroImage: null,
      highlightedText: "Design tokens are a methodology for expressing design decisions in a platform-agnostic way.",
    },
  },
  {
    id: "6",
    type: "image",
    title: "whiteboard-photo.png",
    timestamp: createDate(1, 15, 20), // yesterday at 3:20 PM
    previewContent: {
      imageUrl: "/images/whiteboard-photo.png",
      dimensions: { width: 1920, height: 1080 },
      fileSize: "2.4 MB",
      caption: "Architecture diagram from design sync",
    },
  },
  {
    id: "7",
    type: "note",
    title: "Why semantic tokens matter for our design system",
    timestamp: createDate(1, 14, 15), // yesterday at 2:15 PM
    content: "Semantic tokens create a layer of abstraction that allows us to change the entire look and feel without touching components.",
    previewContent: {
      fullText: "Semantic tokens create a layer of abstraction that allows us to change the entire look and feel without touching components.\n\nKey benefits:\n\n1. **Theming becomes trivial** - Switch from light to dark mode by changing token values, not component code.\n\n2. **Brand flexibility** - White-label products can swap color schemes at the token level.\n\n3. **Consistency enforcement** - Designers and developers reference the same semantic names (e.g., 'color-text-primary' instead of 'gray-900').\n\n4. **Future-proofing** - When the brand evolves, update tokens once rather than hunting through codebases.\n\nImplementation notes:\n- Start with color tokens (most impact)\n- Add spacing and typography next\n- Consider motion/animation tokens for v2",
    },
  },

  // OLDER items (not stale, 2-6 days old)
  {
    id: "8",
    type: "link",
    title: "Figma Variables Deep Dive",
    timestamp: createDate(4, 10, 30), // 4 days ago at 10:30 AM
    url: "https://figma.com/blog/variables",
    previewContent: {
      excerpt: "Variables in Figma allow you to define reusable values for colors, numbers, strings, and booleans. They're the foundation for creating flexible, scalable design systems.",
      heroImage: null,
    },
  },

  // STALE items (7+ days old - these appear in NEEDS ATTENTION section)
  {
    id: "9",
    type: "link",
    title: "Component API patterns",
    timestamp: createDate(9, 12, 0), // 9 days ago
    url: "https://medium.com/component-apis",
    previewContent: {
      excerpt: "A deep dive into different patterns for designing component APIs: compound components, render props, hooks, and more.",
    },
  },
  {
    id: "10",
    type: "link",
    title: "Design system governance models",
    timestamp: createDate(10, 12, 0), // 10 days ago
    url: "https://designsystems.com/governance",
    previewContent: {
      excerpt: "How successful organizations manage and evolve their design systems: federated vs centralized models, contribution workflows, and decision-making frameworks.",
    },
  },
  {
    id: "11",
    type: "note",
    title: "Meeting notes from design sync",
    timestamp: createDate(12, 12, 0), // 12 days ago
    content: "Discussed timeline for Q1 launch. Need to finalize token structure by end of month.",
    previewContent: {
      fullText: "Meeting notes from design sync\n\nAttendees: Sarah, Mike, James, Lisa\n\nDiscussed timeline for Q1 launch:\n- Token structure needs to be finalized by end of month\n- Component library v2 target: mid-February\n- Documentation sprint planned for late January\n\nOpen questions:\n- Do we need a breaking change for the button component?\n- How do we handle legacy token names during migration?\n\nNext steps:\n1. Sarah to draft migration guide\n2. Mike to audit current token usage\n3. Schedule follow-up for January 5th",
    },
  },
  {
    id: "12",
    type: "link",
    title: "Old article about typography",
    timestamp: createDate(35, 12, 0), // 35 days ago - tests "Over a month" formatting
    url: "https://typography.com/blog/best-practices",
    previewContent: {
      excerpt: "Typography best practices for digital products: choosing typefaces, establishing hierarchy, and ensuring readability across devices.",
    },
  },
]
