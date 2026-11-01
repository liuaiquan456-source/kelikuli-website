This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Product privacy and deployment

Public product APIs (`/api/products` and `/api/products/:id`) are read-only and
return approved public fields for active products. Internal tags, prices, stock,
workflow state, SEO editing fields, and customer-note blocks are not returned.
Only explicitly labelled public specifications outside customer-note blocks are
shown. Original database records remain available to authenticated staff through
`/api/admin/products` and `/api/admin/products/:id`.

Set `ADMIN_SESSION_SECRET` to a cryptographically random secret of at least 32
bytes in the server environment before deploying. Use the same secret on all
instances; never expose it through a `NEXT_PUBLIC_` variable. Generate a secret
with `openssl rand -hex 32` and store it in your deployment's secret manager (or
an ignored `.env.local` for development). Admin login fails closed without it.
This release invalidates the old unsigned cookies; administrators must sign in
again. Product integrations that used the old public write endpoints must use
the authenticated admin endpoints or the existing Custom Lab integration.

`/robots.txt` is independent of the database. `/sitemap.xml` reads active products
and published news at request time and includes all seven public top-level
pages. A database failure is reported as an error instead of returning and
caching an incomplete successful sitemap. Check both URLs after deployment,
and purge any reverse-proxy/CDN caches of product pages and API responses that
may still contain the previous public data.

Run the privacy, authentication and sitemap regression tests with `npm test`
(Node.js 24 or later). The tests use synthetic data and do not modify a database.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Manufacturing content and inquiry attribution (2026-11)

Content is maintained in `data/manufacturing.ts` (7 services and industry briefs),
`data/development-projects.ts` (3 explicitly labeled development projects), and
`data/buying-guides.ts` (6 purchasing guides). These pages link to active catalog
products and the shared `/get-a-quote` form. Existing `/news/[slug]` URLs remain
available; `/resources` organizes the new material and existing article archive.

The project entries are **not verified completed customer case studies**. Replace
stage descriptions only when approved sample or order evidence is available.
Confirm MOQ, pricing, capacity and timelines before adding numerical claims.

Before deploying this version, apply the additive database update to the intended
PostgreSQL database using its existing private environment configuration:

```sh
npx prisma db execute --file prisma/updates/20261101-inquiry-attribution.sql --schema prisma/schema.prisma
npx prisma generate
npm test
npm run build
```

The SQL is repeatable and preserves existing inquiries. The `attribution` field
stores source and landing paths, service, project, product ID, country, requested
quantity and dimensions. It is visible only in the authenticated inquiry dashboard.
The public submission API returns only a receipt. Custom Lab's existing integration
can continue creating inquiries without attribution because the column has a default.

New design uploads are written outside `public/`. Set `INQUIRY_UPLOAD_DIR` to a
persistent private absolute directory when using release folders, or keep
`PROJECT_ROOT` pointing at the stable application directory (default storage:
`$PROJECT_ROOT/private/inquiries`). Preserve this directory across deployments and
include it in private backups. Downloads require a valid active-admin session.
Existing legacy public upload URLs are unchanged; this update does not relocate
historical files. Nginx/proxy request limits must allow a 30 MB file plus multipart
overhead (for example `client_max_body_size 32m`).

Optional server environment configuration:

```text
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
INQUIRY_UPLOAD_DIR=/absolute/persistent/private/inquiries
```

Without a valid GA4 ID no Google Analytics script is loaded. Website attribution
still works. With an ID, `generate_lead` is emitted only after the server confirms
a saved inquiry; attachment failures and failed submissions emit no lead event.
See Google's [recommended generate_lead event](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead).
Only controlled paths and content identifiers are sent, not contact details,
messages, filenames, country, requested quantity or dimensions. The first public
page is kept in tab session storage; the quote's immediate source is stored
separately. Query strings are omitted.

In the GA4 web stream, disable enhanced measurement's automatic history/page-view
and form-interaction events when using this manual implementation to avoid duplicate
page views and inferred form submissions. Mark `generate_lead` as a key event and
register `source_page`, `landing_page`, `service`, `project` and `product_id` as
custom dimensions if needed. Validate with DebugView / Realtime after configuring
the actual property. No property ID or analytics account changes are assumed by
this code.

Validation: `npm test` includes content-link integrity, attribution sanitization,
inquiry access control, private design-file downloads, initial FAQ HTML and GA4
payload checks. Product cards and pagination are rendered on the server; FAQ
answers use native details/summary elements and are present before interaction.
