export type Category = { id: string; name: string; slug: string; description?: string | null; order: number };
export type Article = {
  id: string; title: string; slug: string; excerpt: string; content: string; coverImage?: string | null;
  status: "DRAFT" | "PUBLISHED"; categoryId: string; category?: Category; tags: string[];
  readingTime: number; publishedAt?: Date | null; createdAt: Date; updatedAt: Date;
};
export type Settings = {
  id: string; ownerName: string; headline: string; bio: string; email?: string | null; github?: string | null;
  linkedin?: string | null; x?: string | null; avatarUrl?: string | null; extraLinks?: unknown;
};
export type Question = {
  id: string; body: string; status: "NEW" | "ANSWERED" | "HIDDEN"; answer?: string | null;
  isPublic: boolean; createdAt: Date; answeredAt?: Date | null;
};

export const mockCategories: Category[] = [
  "Latest Articles", "Algorithms & Problem Solving", "Backend Engineering", "Installations", "DevOps", "Cloud",
].map((name, order) => ({ id: `category-${order}`, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), order }));

export const mockSettings: Settings = {
  id: "site", ownerName: "Alex Morgan", headline: "I build things for the web, one thoughtful commit at a time.",
  bio: "Software engineer focused on reliable backend systems, developer tooling, and interfaces that feel calm to use.\n\nCurrently exploring distributed systems and sharing what I learn along the way.",
  email: "hello@example.dev", github: "https://github.com", linkedin: "https://linkedin.com",
};

const now = new Date("2026-09-24T12:00:00.000Z");
export const mockArticles: Article[] = [
  { id: "article-1", title: "A small guide to dependable background jobs", slug: "dependable-background-jobs", excerpt: "A practical look at retries, idempotency, and the quiet details that keep async work reliable.", content: "## The work outlives the request\n\nMoving work off the request path is easy. Making it dependable takes a few deliberate choices.\n\n### Start with idempotency\n\nA job should be safe to run more than once. Give each unit of work a stable key and make side effects conditional on that key.\n\n```ts\nawait queue.add('send-digest', payload, { jobId: digest.id });\n```\n\nRetries are useful when they are predictable, bounded, and observable.", status: "PUBLISHED", categoryId: "category-2", category: mockCategories[2], tags: ["backend", "queues", "reliability"], readingTime: 5, publishedAt: now, createdAt: now, updatedAt: now },
  { id: "article-2", title: "Notes from rebuilding my personal site", slug: "rebuilding-my-personal-site", excerpt: "What I optimized for when a portfolio became a tiny publishing system.", content: "## Keep the content close\n\nA personal site is a small product. I wanted a calm writing surface, a fast public page, and a private place to maintain both.\n\nThe best architecture is the one that stays out of the way.", status: "PUBLISHED", categoryId: "category-0", category: mockCategories[0], tags: ["nextjs", "design", "cms"], readingTime: 3, publishedAt: new Date("2026-09-12T12:00:00.000Z"), createdAt: now, updatedAt: now },
  { id: "article-3", title: "The boring parts of shipping to production", slug: "boring-parts-of-production", excerpt: "Health checks, rollbacks, and migration discipline are features too.", content: "## Make the safe path the easy path\n\nA release process that works on a tired Friday is better than a clever process that only works in a demo.", status: "PUBLISHED", categoryId: "category-4", category: mockCategories[4], tags: ["devops", "delivery"], readingTime: 4, publishedAt: new Date("2026-08-30T12:00:00.000Z"), createdAt: now, updatedAt: now },
];

export const mockQuestions: Question[] = [
  { id: "question-1", body: "What helped you get comfortable with system design?", status: "ANSWERED", answer: "Building small systems and then tracing the failure modes helped more than memorizing diagrams.", isPublic: true, createdAt: now, answeredAt: now },
  { id: "question-2", body: "What are you learning right now?", status: "ANSWERED", answer: "I am spending time with Postgres internals, queue semantics, and the craft of technical writing.", isPublic: true, createdAt: now, answeredAt: now },
];