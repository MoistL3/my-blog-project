# Developer portfolio CMS

A dark, terminal-inspired portfolio and blog with a single-owner admin workspace. The public pages can be previewed without a database using starter content. Mutations are intentionally disabled until a database and owner credentials are configured.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Prisma and PostgreSQL
- Auth.js v5 with a GitHub numeric-ID allowlist
- Vercel Blob for article and profile images
- Markdown rendering with GFM and Shiki-powered code highlighting

## Local setup

1. Copy `.env.example` to `.env.local` and set the values you use. The site can run without this file; do not commit `.env.local`.
2. Install packages with `npm install`.
3. Generate the Prisma client with `npm run db:generate`.
4. Once `DATABASE_URL` and `DIRECT_URL` point to a PostgreSQL database, run `npm run db:push` and `npm run db:seed`.
5. Start the app with `npm run dev`.

Required variables are documented in `.env.example`. Configure a GitHub OAuth app with the callback URL `/api/auth/callback/github`. `ADMIN_GITHUB_ID` must be the owner's numeric GitHub user ID; everyone else is rejected during OAuth sign-in, and every admin page/action checks the same ID.

When no database is configured, public routes display mock content and anonymous questions are accepted into temporary in-memory preview state. Admin pages are protected and show a GitHub sign-in setup message until OAuth is configured. Database mutations report a clear setup message rather than silently pretending data was saved. With PostgreSQL configured, the three-per-hour limiter uses a random anonymous cookie token stored only as a hash; it does not collect or store IP addresses. The in-memory limiter is used only in local preview mode without a database.

Image uploads require `BLOB_READ_WRITE_TOKEN`, an authenticated admin session, and accept JPEG, PNG, WebP, or AVIF files up to 10 MB. Uploads return a URL; save the associated article or settings form to publish that URL.

## Routes

- Public: `/`, `/articles`, `/articles/[slug]`, `/qa`
- Admin: `/admin`, `/admin/settings`, `/admin/articles`, `/admin/categories`, `/admin/questions`

Run `npm run lint` and `npm run build` to validate the app.