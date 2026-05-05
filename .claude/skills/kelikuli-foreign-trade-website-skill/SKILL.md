---
name: kelikuli-foreign-trade-website-builder
description: Use this skill when building, rewriting, or optimizing an English B2B foreign-trade website for Kelikuli, a resin toy / resin figurine factory offering wholesale, custom OEM/ODM, blind box, Zakka, seasonal, and collectible resin products. It provides website structure, SEO copy rules, page templates, design direction, and Claude Code implementation guidance inspired by factory showcase websites without copying competitors.
---

# Kelikuli Foreign Trade Website Builder

## Purpose
Use this skill to help Kelikuli create a professional English PC/mobile responsive foreign-trade website for Google SEO and B2B buyer conversion.

The site should communicate:
- Kelikuli is a source factory for resin toys, resin figurines, handmade resin ornaments, blind box collectibles, and OEM/ODM customization.
- The factory started in 2005. If exact figures such as plant area, employee count, certifications, or export markets are not confirmed by the user, mark them as placeholders instead of inventing facts.
- The target customers are overseas brands, gift companies, wholesalers, retailers, distributors, IP owners, souvenir buyers, and promotional product buyers.

## Competitor reference handling
The user may reference https://www.crafts-custom.com/ as a layout benchmark. Use it only as structural inspiration. Do not copy brand name, images, wording, contacts, address, certificates, or claims.

Reference-style sections to emulate with original Kelikuli content:
1. Top contact bar with WhatsApp / email / language switch.
2. Main navigation: Home, About Us, Products, Custom Service / OEM ODM, News, Contact.
3. Homepage hero banner with factory + product showcase.
4. Product category grid.
5. Why Choose Kelikuli section.
6. Factory strength / numbers section.
7. Customization process section.
8. Certification / quality control section.
9. Partner / customer trust section.
10. Contact CTA and footer.

## Brand voice
Write in clear B2B English. Use natural Google SEO wording, not keyword stuffing.

Tone:
- Professional but warm.
- Factory-direct and trustworthy.
- Handmade/custom/OEM/ODM focused.
- Suitable for resin toy buyers and brand sourcing managers.

Avoid:
- Overly exaggerated claims such as "world-leading" unless proven.
- Direct use of copyrighted IP names in product category names unless user confirms authorization. For story-inspired products, use safer wording like "Prince Series", "storybook-inspired resin ornaments", or "fairy-tale collectible figurines".
- Copying competitor text.
- Chinese text on English website images unless specifically requested.

## Recommended sitemap
Create these pages unless the user requests fewer pages:

- `/` Home
- `/about-us` About Kelikuli
- `/products` Product overview
- `/products/resin-figurines`
- `/products/blind-box`
- `/products/zakka-series`
- `/products/seasonal-resin-crafts`
- `/products/custom-resin-toys`
- `/custom-oem-odm` Custom OEM/ODM Service
- `/quality-control` Quality Control / Certifications
- `/news` SEO blog/news listing
- `/contact` Contact / Inquiry

Optional pages:
- `/factory-tour`
- `/brand-collaboration`
- `/download`
- `/faq`

## Homepage layout
Use this order for a PC homepage:

1. Announcement/contact top bar
   - WhatsApp
   - Email
   - Language selector placeholder

2. Header navigation
   - Logo: Kelikuli
   - Menu: Home / About Us / Products / Custom Service / News / Contact
   - Primary CTA: Inquiry Now

3. Hero banner
   Suggested headline:
   "Custom Resin Toys & Collectible Figurines Manufacturer"

   Suggested subheadline:
   "Factory-direct OEM/ODM resin figurines, blind box collectibles, Zakka ornaments, and seasonal gift crafts since 2005."

   CTA buttons:
   - Get Custom Quote
   - View Products

   Visual direction:
   - Matte hand-painted resin toys.
   - Clean factory or studio background.
   - Warm neutral lighting, not too yellow.
   - Less crowded product display; leave space for text.

4. Recommended product categories
   Cards:
   - Resin Figurines
   - Blind Box Collectibles
   - Zakka Resin Ornaments
   - Seasonal Gifts
   - Custom Character Toys
   - Snow Globes / Fridge Magnets / Piggy Banks if relevant

5. Why Choose Kelikuli
   Four cards:
   - Factory Experience Since 2005
   - OEM/ODM Custom Development
   - Hand-Painted Matte Finish
   - Responsive B2B Service

6. Factory strength numbers
   Use only confirmed numbers. Otherwise use placeholders:
   - Since 2005
   - [Factory Area] m²
   - [Employees]+ Team Members
   - [Export Markets]+ Markets

7. Customization process
   Steps:
   - Idea / Reference
   - 3D Modeling or Clay Prototype
   - Sampling
   - Mold Making
   - Hand Painting
   - Quality Check
   - Bulk Production & Delivery

8. Quality & certifications
   Show certification placeholders if user has not provided proof.
   Use wording: "Certification display area" rather than naming unconfirmed certificates.

9. SEO news/blog section
   Suggested article topics:
   - How to Customize Resin Figurines for Your Brand
   - Resin Blind Box Manufacturing Guide
   - Why Matte Hand-Painted Resin Toys Are Popular in Gift Markets
   - Seasonal Resin Crafts for Halloween and Christmas Wholesale

10. Contact CTA
   Headline:
   "Ready to Develop Your Custom Resin Toy Collection?"

## Visual design system
Preferred style:
- Modern B2B factory website.
- White / warm cream background.
- Soft beige, clay, light brown, muted orange accents.
- Large clean spacing, not crowded.
- Rounded product cards.
- High-resolution banner areas.
- Product-first layout with factory credibility.

Do not make the site look like:
- A pure retail shop only.
- A childish toy store without factory credibility.
- A competitor clone.
- A cluttered catalog page.

## SEO rules
For every page, provide:
- SEO title, 50–60 characters when possible.
- Meta description, 140–160 characters when possible.
- One H1 only.
- Clear H2/H3 structure.
- Natural internal links.
- Image alt text.
- FAQ section when useful.

Primary keyword clusters:
- custom resin toys manufacturer
- resin figurines manufacturer
- resin crafts wholesale
- custom blind box manufacturer
- OEM ODM resin figurines
- hand painted resin ornaments
- Zakka resin ornaments wholesale
- seasonal resin crafts supplier
- collectible figurines manufacturer

Homepage SEO title suggestion:
Custom Resin Toys & Figurines Manufacturer | Kelikuli

Homepage meta description suggestion:
Kelikuli manufactures custom resin toys, figurines, blind box collectibles, Zakka ornaments, and seasonal resin crafts with OEM/ODM service since 2005.

## Implementation guidance for Claude Code
When asked to build the website, prefer:
- Next.js + TypeScript + Tailwind CSS, or plain HTML/CSS if the user requests simple static pages.
- Component-based structure.
- Responsive design for PC and mobile.
- Reusable content objects for product categories and process steps.
- Clean SEO metadata.
- Placeholder images with clear filenames if real product images are not provided.

Recommended components:
- `TopBar`
- `Header`
- `Hero`
- `CategoryGrid`
- `WhyChoose`
- `StatsSection`
- `CustomizationProcess`
- `QualitySection`
- `NewsPreview`
- `ContactCTA`
- `Footer`

## Image prompt rules
When generating image prompts for the user:
- Mention Kelikuli only if text is requested.
- Use English website text unless user requests Chinese.
- Use matte resin toy texture, hand-painted finish, soft studio/factory background.
- Keep composition spacious for PC banners.
- For homepage PC banner use 3840×1200 or 1920×600 ratio.
- Avoid deformed characters, excessive toys, messy factory background, overly yellow tone, and unauthorized IP names.

Example banner prompt:
"A premium PC website hero banner for Kelikuli, a custom resin toy and figurine manufacturer. Matte hand-painted resin figurines and blind box collectibles arranged on a clean studio worktable, subtle factory shelves in the background, warm neutral daylight, spacious left text area, modern B2B visual style, soft beige and cream tones, not crowded, no Chinese text, high-resolution 3840x1200 composition."

## Quality checklist before final output
Before finishing any website work, check:
- The brand name is spelled Kelikuli.
- No competitor name remains.
- No unverified certificates, addresses, or numbers are claimed.
- The page is not overly crowded.
- B2B inquiry CTA is visible above the fold.
- SEO title and meta description exist.
- Product category names are clear.
- Content is original and not copied from the reference site.
