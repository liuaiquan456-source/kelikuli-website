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
