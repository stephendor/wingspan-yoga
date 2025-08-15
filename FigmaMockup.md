
---Alright — I’ll produce a **Figma-ready page structure map** that clearly marks where each quoted section goes, so a designer can drop them in with zero ambiguity.
I’ll structure it so it can be pasted into Figma’s “Notes” or “Page description” areas, or used as an annotation layer.

---

# **Wingspan Yoga – Page Structure & Quoted Text Placement Map**

---

## **Home Page**

**Purpose:** Introduce Wingspan Yoga’s ethos, highlight main offerings, and direct users to key sections.

**Structure:**

1. **Hero Section**

   * Background: Soft gradient (pink → blue) with a large forest/lake image overlay.
   * Headline: “Flow, Breathe, Belong”
   * Subheadline: “Yoga inspired by nature’s rhythm, for body, mind, and spirit.”
   * CTA buttons: “Book a Class” / “Explore Retreats”
2. **Welcome Message**

   * Short intro text (new, not from quotes) – summarising Anna’s style.
3. **Featured Offerings**

   * Cards linking to: North Wales Classes, London Classes, Online, Private Sessions, Retreats.
4. **Quote/Philosophy Pull-out**

   * **Insert:** from *What to Expect in a Class*

     > “Take a moment where you are right now. Can you feel your feet on the ground?...”
5. **Upcoming Events Preview**

   * Pull 2–3 retreat teasers with links.
6. **Blog Preview**

   * 2–3 latest blog post excerpts.
7. **Footer**

   * Navigation links, social media, contact info.

---

## **About Anna**

**Purpose:** Tell Anna’s story, background, and influences.

**Structure:**

1. **Hero Image** – Anna teaching or in nature.
2. **Biography Section**

   * **Insert:** from *About Anna*

     > “Hello, I'm Anna! I attended my first yoga class in Osmington, Dorset in 1993…”
3. **Teaching Influences**

   * **Insert:** from *Vanda Scaravelli* section.
4. **Personal Life & Inspiration**

   * Part of supplied biography where Anna discusses Stephen, North Wales, and spiritual practices.
5. **Philosophy Quote**

   * From *What to Expect in a Class* or Scaravelli passage.

---

## **North Wales Classes**

**Purpose:** List in-person classes in North Wales with schedule and booking links.

**Structure:**

1. **Hero Image** – Snowdonia or coastal scene.
2. **Class Details**

   * Brief intro paragraph (new).
3. **Private Sessions Promo**

   * Link to Private Sessions page.

---

## **London Classes**

**Structure:**

* Same format as North Wales Classes but with London imagery and availability.

---

## **Online Classes**

**Structure:**

1. **Hero Image** – Calm indoor yoga space with plants.
2. **Description** – How online classes work, tools used.
3. **Schedule & Booking**.

---

## **Private Sessions**

**Purpose:** Promote 1-to-1 and small group sessions.

**Structure:**

1. **Hero Image** – Anna in a quiet yoga space.
2. **Main Text**

   * **Insert:** from *Private Sessions*

     > “Private sessions can be taken on an ongoing basis, as a short series…”
3. **Booking CTA**.

---

## **Retreats & Workshops**

**Purpose:** Detail upcoming and past retreats.

**Structure:**

1. **Hero Image** – Scenic retreat location.
2. **Retreat Blocks**

   * **Insert:** Retreat description #1 (Snowdonia)
   * **Insert:** Retreat description #2 (Worcestershire)
3. **Booking Links** – Direct to booking system.
4. **Testimonials** (optional future).

---

## **Blog**

**Purpose:** Share reflections, philosophy, and inspiration.

**Structure:**

1. **Blog Post Cards** – Image, title, excerpt.
2. **Post Example** –

   * **Insert:** from *Blog Writing* example (trees, roots, gravity).

---

## **Members Area**

**Purpose:** Give paying members access to gated resources.

**Structure:**

1. Login form.
2. Member dashboard: Bookings, Video Library, Resources.
3. **Video Library**

   * Categorised by topic.
   * Vimeo/YouTube private embeds.

---

## **Contact Page**

**Purpose:** Provide direct contact and location info.

**Structure:**

1. Contact form.
2. Map embed (North Wales location).
3. Email and phone links.

---

## **Design Notes for Figma**

* **All quoted text** to be imported as locked text boxes in correct section with the tag `#QUOTE`.
* **Photography placeholders** labelled `#IMAGE - TYPE` (e.g., `#IMAGE - Forest`, `#IMAGE - Anna Portrait`).
* **Colour Styles:** `SoftPink`, `SoftGreen`, `SoftBlue`, `GradientPinkBlue`.
* **Text Styles:** `Heading1`, `Heading2`, `BodyText`, `QuoteText`.
* All page frames in Figma should have **annotation layer** listing the above structure.

---

If you want, I can next **turn this into an actual Figma wireframe outline** — with grey boxes, placeholders, and quote text blocks already positioned — so a designer could drag and drop into final visuals without re-reading the brief.
Do you want me to build that wireframe plan next?


# **Wingspan Yoga – Figma Wireframe Blueprint**

---

## **Global Figma Setup**

**Page Setup in Figma:**

* **Page Name:** `Wingspan Yoga – Wireframes`
* **Colour Styles:**

  * `SoftPink` #F9E1E8
  * `SoftGreen` #D9EAD3
  * `SoftBlue` #D6EAF8
  * `GradientPinkBlue` (SoftPink → SoftBlue vertical gradient)
* **Text Styles:**

  * `Heading1`: Playfair Display, 48px, bold
  * `Heading2`: Playfair Display, 32px, semi-bold
  * `BodyText`: Lato, 18px, regular
  * `QuoteText`: Lato Italic, 20px, soft grey (#555)
* **Grid:** 12-column grid, 80px margins, 20px gutters

---

## **Home Page Frame**

**Frame Name:** `Home Page`
**Height:** \~4500px (scrolling page)

**Layer Structure:**

1. `Hero Section`

   * `#IMAGE - HeroForestLake` (full-width, 100% screen height)
   * `Text - Heading1`: “Flow, Breathe, Belong”
   * `Text - BodyText`: “Yoga inspired by nature’s rhythm, for body, mind, and spirit.”
   * `Button - Primary`: “Book a Class”
   * `Button - Secondary`: “Explore Retreats”

2. `Welcome Message`

   * Placeholder for 100–150 words intro (new copy)

3. `Featured Offerings`

   * 5 horizontally scrollable cards: North Wales, London, Online, Private Sessions, Retreats

4. `Quote / Philosophy Pullout`

   * `#QUOTE - WhatToExpectExcerpt`:

     > “Take a moment where you are right now. Can you feel your feet on the ground?...”

5. `Upcoming Events Preview`

   * 2 retreat blocks with `#IMAGE` placeholders and 30–40 word teasers

6. `Blog Preview`

   * 3 post cards with `#IMAGE` + 2-line excerpts

7. `Footer`

   * Navigation, contact info, social icons

---

## **About Anna Frame**

**Frame Name:** `About Anna`
**Height:** \~3500px

**Layer Structure:**

1. `Hero Image` – `#IMAGE - AnnaPortraitNature`
2. `#QUOTE - AboutAnnaBiography` (full supplied text)
3. `#QUOTE - VandaScaravelli` (full supplied text)
4. `Philosophy Block` – excerpt from *What to Expect in a Class*
5. Side-by-side gallery of Anna teaching & natural landscape shots

---

## **North Wales Classes Frame**

1. `Hero` – `#IMAGE - SnowdoniaCoast`
2. `Class Info` – new copy (schedule, prices)
3. `CTA - Book Now`
4. `Promo - Private Sessions` with button to dedicated page

---

## **London Classes Frame**

(Same as North Wales layout, with `#IMAGE - LondonYogaStudio`)

---

## **Online Classes Frame**

1. `Hero` – `#IMAGE - IndoorYogaPlants`
2. `How It Works` block – Zoom, schedule, pricing
3. `CTA - Join Online Class`

---

## **Private Sessions Frame**

1. `Hero` – `#IMAGE - QuietYogaSpace`
2. `#QUOTE - PrivateSessionsDescription` (full supplied text)
3. CTA block with booking link

---

## **Retreats & Workshops Frame**

1. `Hero` – `#IMAGE - RetreatScenery`
2. Retreat Block #1 – `#QUOTE - RetreatDescriptionSnowdonia`
3. Retreat Block #2 – `#QUOTE - RetreatDescriptionWorcestershire`
4. CTA – Book a Retreat

---

## **Blog Frame**

1. Blog listing grid (image + title + excerpt)
2. Blog Post Template – with space for images inline with text

   * Example post: `#QUOTE - BlogTreesRootsGravity`

---

## **Members Area Frame**

1. Login form
2. Dashboard with 3 main links: `Bookings`, `Video Library`, `Resources`
3. Video Library Template – Grid of videos, all `#IMAGE - VideoThumbnail` placeholders, locked for members

---

## **Contact Frame**

1. Contact Form
2. `#IMAGE - MapEmbedNorthWales`
3. Contact details block

---

## **Notes for Designer**

* Quoted text layers should be **locked** so the designer cannot accidentally edit them.
* Placeholder images should be tagged `#IMAGE` + type for easy replacement.
* Keep enough whitespace to preserve the “spacious” feel.
* Avoid heavy shadows; use soft blurs for depth.

---

If you want, I can now **convert this wireframe blueprint into an SVG/PNG grey-box mockup** so you or your designer can drag it straight into Figma and start replacing placeholders.
That way you wouldn’t have to build the layout manually in Figma from this spec.

Do you want me to generate that mockup file?

