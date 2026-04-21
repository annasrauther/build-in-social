# autoshorts.ai — Full Competitive Teardown

_Captured: 2026-04-21. All data collected via direct Chrome MCP browsing of an authenticated user (`annasrauther95@gmail.com`, Free tier), corroborated with their public `_next/data` payloads. Screenshots saved during the session; links to key pages noted inline._

This document is the source-of-truth brief for the work tracked in [`/Users/annasrauther/.claude/plans/manager-i-want-you-snuggly-ocean.md`](../../../.claude/plans/manager-i-want-you-snuggly-ocean.md).

---

## 1. Sitemap

### Public (unauthenticated)
| Path | Purpose |
|---|---|
| `/` | Landing — hero video embed + scrolling sample grid + how-it-works + pricing + FAQ |
| `/faq` | Full FAQ (superset of landing) |
| `/terms` | Terms & Conditions (footer) |
| `/privacy` | Privacy Policy (footer) |
| `/contact` | Contact form (footer) |
| `/articles` | Blog / SEO articles (footer) |
| Alternative comparison links in footer | Faceless.video · Vadoo AI · Nullface AI · Smart Short AI · Crayo AI · AIVideo.com · AI Music Video Generator |

### Authenticated (`/dashboard/*`)
| Path | Purpose |
|---|---|
| `/dashboard/series` | Empty state + "Create your series" CTA; lists user's series once any exist |
| `/dashboard/series/create` | 4-step series wizard (Destination → Content → Settings → Create) |
| `/dashboard/series/view` | Per-series detail / post history (inferred — user's Free tier had no series) |
| `/dashboard/tools/ai-avatar` | **FREE** standalone avatar-overlay MP4 generator |
| `/dashboard/tools/motion` | **Motion 1.0** — image-to-video animation (paid; uses Motion Credits) |
| `/dashboard/tutorials` | Labeled "Guides" in nav; 7 embedded YouTube tutorials |
| `/dashboard/billing` | Plan usage + inline pricing cards + FAQ |
| `/dashboard/account` | Minimal: Update Email + Change Password |

### Endpoints confirmed as 404
`/dashboard/create`, `/dashboard/guides`, `/dashboard/avatar`, `/custom-prompt-tool`, `/affiliates` — these are either internal-only routes or dead links from older copy. The live routes are `/dashboard/series/create` and `/dashboard/tutorials` respectively.

---

## 2. Landing page (`/`) — section by section

### 2.1 Hero
- **Headline:** _"Faceless Videos on Auto-Pilot."_
- **Subheadline:** _"Our powerful AI video creation platform allows you to fully automate a faceless channel. Get views and grow while you sleep."_
- **Primary CTA (logged-in):** "Visit Dashboard" → `/dashboard/series`
- **Primary CTA (logged-out):** Sign in with Google — observed on screenshots outside the auth'd session.
- **Hero visual:** embedded YouTube video thumbnail titled _"What is AutoShorts.ai?"_ with overlay text _"WANT TO AUTOMATE FACELESS VIDEOS LIKE THESE?"_
- **Page title tag:** `AutoShorts.ai | #1 Faceless Video Generator for TikTok & YouTube` — aggressive SEO positioning as "#1".

### 2.2 Scrolling video grid ("Unique Videos Each Time")
- **Caption:** _"Choose a video in any niche"_
- **Tiles:** pairs of `(viewCount, styleLabel)` repeated for visual density. Pulled from the live DOM:
  - 13.2k — AutoShorts
  - 43.7k — AutoShorts
  - 28.8k — Childrens Book
  - 62.3k — AutoShorts V2
  - 22.6k — UGC Hook
  - 96.4k — AutoShorts
  - 17.1k — Lego
  - 71.9k — Disney Toon
  - 55.3k — Expressionism
  - 92.7k — Minecraft
  - 33.8k — AutoShorts
  - 67.2k — GTAV
  - 19.5k — AutoShorts
  - 45.6k — Comic Book
  - 88.3k — AutoShorts
  - 51.4k — Expressionism
  - 18.9k — AutoShorts
  - …
- **Purpose:** social proof *without* testimonials. Also doubles as art-style preview.

### 2.3 "How Does It Work?" — 3 steps
1. **Create a Series** — _"Choose a topic for your faceless video series. Select from our preset list or create a custom prompt. Our AI will begin crafting your first unique video immediately."_
2. **Preview and Customize** — _"Review your AI-generated video before it's posted. Edit the script, title, images, or background music as needed. Each video is uniquely created for your series."_
3. **Watch Your Channel Grow** — _"Edit your posting schedule, connect your channels, and let AutoShorts.ai handle the rest. We'll take care of creating and posting while you kick back and relax."_

### 2.4 Pricing block
Title: **PRICING · PAY FOR WHAT YOU NEED** · Monthly/Yearly toggle · _"Yearly 2 months free!"_

| Tier | Monthly | Yearly (eff/mo) | Posting frequency | Series limit | Motion credits | Other |
|---|---|---|---|---|---|---|
| FREE | $0 | — | 1 video total | 1 | 0 | **"Temporarily paused"** (bot abuse) |
| STARTER | $19 | $16 ($190/yr) | 3 times a week | 1 | 27 | — |
| DAILY | $39 | $33 ($390/yr) | 1 per day | 1 | 62 | — |
| HARDCORE | $69 | $58 ($690/yr) | 2 per day | 1 | 124 | — |

Every paid tier includes, as line items: _Auto-post to channel · Edit & preview videos · HD Video Resolution · Background Music · Voice Cloning · No Watermark_. The FREE tier matches the same feature list but with a watermark and 0 motion credits.

The raw payload (from `window.__NEXT_DATA__`) confirms `frequency` values 3/7/14 correspond to "3/week", "1/day", "2/day" respectively, and that yearly IDs are separate Stripe/PayPal plans (648/649/650).

### 2.5 FAQ (landing preview)
Sections: **Series & Videos** (16 questions), **Billing** (6 questions). On the dedicated `/faq` page every Q/A is pre-rendered; on `/` they collapse into an accordion. A small sample captured verbatim:

- **"What is a Series?"** — _"A Series in AutoShorts.ai is an automation setup that creates and uploads AI videos on a schedule (like daily or weekly). Each Series runs continuously and generates new videos based on your chosen topic and settings, allowing your channel to run on autopilot."_ · _"Each series can link to one channel from each platform: TikTok, YouTube, and Instagram."_ · _"You can delete and create a new series to change your topic (up to 10 times per day)."_
- **"Is there a free trial?"** — _"You bet your sweet bippy there is. Simply create an account and you can create your first series for free to test a video. No credit card required."_ · _"Update: We have temporarily suspended the free plan due to abuse from botting / spamming. We will be re-enabling it soon once we implement a better bot detection system."_
- **"Can I cancel at anytime?"** — _"Absolutely. We hate services that purposefully make it difficult to cancel. You can cancel at the click of a button from the dashboard's billing page."_
- **"Can I get a refund?"** — _"Unfortunately, we cannot offer refunds as costs incurred…"_
- **"Can I replace an existing series with a new one?"** — _"Absolutely! You can delete any current series and start fresh with a new topic or settings anytime (up to 10 times per day)."_
- **"How do I create a video?"** — _"It's important to know that AutoShorts.ai wasn't designed for single video creation, but instead for creating a series…"_  — note the explicit anti-one-off framing.

### 2.6 Footer
- **Company:** Pricing · Affiliates · Contact Us
- **Support:** FAQ · Terms & Conditions · Privacy Policy · Google API Disclosure · Articles · Custom Prompt Tool
- **Alternatives:** Faceless.video · Vadoo AI · Nullface AI · Smart Short AI · Crayo AI · AIVideo.com · AI Music Video Generator
- **Social:** Facebook · YouTube · Instagram

The "Alternatives" block is pure SEO — they rank on competitor brand searches and convert the traffic back.

### 2.7 Visual style
- **Palette:** purple-to-blue gradient background (`#4F3BC0` → `#6D5BE8` ish), white content cards, lime/yellow highlight on CTA. Not far from Midjourney/Crayo territory.
- **Type:** sans-serif geometric (looks like Manrope or Poppins). Headings are **UPPERCASE BOLD** in hero (`CREATE A SERIES`, `PRICING`), inner heading sizes follow the usual h1-h3 scale.
- **Animations:** page is Next.js static SSG (seen via `__NEXT_DATA__` with `"nextExport":true, "autoExport":true`). Grid uses CSS transform animation for the infinite scroll.

---

## 3. Auth & navigation

### 3.1 Sign-in
- **Primary:** Google OAuth (single large button). Client ID observed: `262744178120-m5ptibpi8ul0kj4jb76cf63esmdh0v2i.apps.googleusercontent.com`.
- **Fallback:** email + password (unverified from observation; inferred from account page's "Update Email" + "Change Password" affordances).
- **No pre-signin quiz, no niche collection, no email capture on a landing modal.** Landing → Sign in → Dashboard.

### 3.2 Reading the authenticated nav (sidebar)
Top-level collapsible sections:
1. **SERIES** (expanded default)
   - `VIEW` → `/dashboard/series`
   - `CREATE` → `/dashboard/series/create`
2. **TOOLS** (collapsed default; chevron reveals)
   - `AI AVATAR` → `/dashboard/tools/ai-avatar` · FREE badge
   - `MOTION 1.0` → `/dashboard/tools/motion` · NEW badge
3. **GUIDES** → `/dashboard/tutorials`
4. **BILLING** → `/dashboard/billing`
5. **ACCOUNT** → `/dashboard/account`

Top-right nav: `Upgrade` (brand CTA) · `Dashboard` · `Affiliates` · `Logout`.

---

## 4. Create-a-Series wizard (4 steps)

### Step 1 — Destination
Label: _"The account where your video series will be posted."_ · Dropdown options:
- **Email Me Instead** (always available)
- **Link a TikTok Account +** (locked 🔒 on Free — requires paid)
- **Link a YouTube Account +** (locked 🔒)
- **Link an Instagram Account +** (locked 🔒)

Inline warning after selection: _"Tip: Make sure your account is warmed up for the best results."_

The _"Email Me Instead"_ option is the single most interesting design move on the site: Free-tier users get a finished deliverable by email without OAuth-linking any platform. It de-risks first-time usage to near-zero.

### Step 2 — Content
Label: _"What will your video series be about?"_ · Dropdown with two sections:

**Custom Topic:**
- Custom Prompt (free-text, topic-specific sub-inputs appear)

**Popular Topics** (each surfaces a topic-specific input pane once selected):
- Bible Stories (NEW badge)
- Random AI Story
- Travel Destinations
- What If?
- Scary Stories
- Bedtime Stories
- Interesting History
- Urban Legends
- Motivational
- Fun Facts
- Long Form Jokes
- Life Pro Tips
- ELI5
- Philosophy
- Product Marketing
- (list scrolls — ~15+ presets total)

Example of topic-specific input: selecting **Product Marketing** reveals _"Product Details"_ textarea, limit 3000 chars. _"Show Sample"_ link inline.

### Step 3 — Series Settings
**Narration Voice** — ~30 presets listed as `Name | Gender, Accent, Style`:

Echo (Male, American, Excited) · Alloy (Female, American) · Onyx (Male, American, Slow, Deep) · Fable (Female, British) · Nova (Female, American, Soft, Soothing) · Shimmer (Female, American) · Adam (Male, American, Deep, Narration) · Sawyer (Male, American, Deep, Narration) · Suzanne (Female, American, Calm, Conversational) · Caleb (Male, American, Casual, Conversational) · Tyrone (Male, American, Crisp, Social Media) · Tom (Male, American, ASMR, Soft) · Alice (Female, British, ASMR, Soft) · Wyatt (Male, American, Wise, Cowboy) · Tri Ramadhani (Male, Indonesian, Excited, Narrative) · Bartholomeus (Male, German, Grim, Gruesome) · Marcus (Male, American, Authoritative, Deep) · Rodney (Male, American, Gruff, Deep) · Joseph (Male, American, Deep, Narration) · Eldrin (Male, British, Warm, Friendly) · Talia (Female, American, Soft, News) · Maisie (Female, American, Friendly, Narration) · Sanna (Female, Swedish, Seductive, Character) · Alicia (Female, British, Confident, News) · Zoe (Female, American, Expressive, Social Media) · Jessica Bogart (Female, American, Crisp, Wicked) · Axell (Male, British, Excited, Social Media) · Dan Dan (Male, Spanish, Excited, Social Media) · Marshall (Male, German, Upbeat, Character) · Aiden (Male, English, Excited) · Otani (Male, Japanese, Narration) · Leon Stern (Male, German, Narration)

Plus **Voice Clones – New!** with a `Create Voice Clone` CTA.

**Art Style** — 18 presets: AutoShorts V2 · Lego · Comic Book · Disney Toon · Studio Ghibli · Pixelated · Creepy Toon · Childrens Book · Photo Realism · Minecraft · Watercolor · Expressionism · Charcoal · GTAV · Anime · AutoShorts · Film Noir · 3D Toon

**Aspect Ratio** — 3 options: Vertical (9:16) · Horizontal (16:9) · Square (1:1)

**Video Language** — English 🇺🇸 (dropdown — other languages present but not enumerated)

**Duration Preference** — "60 to 90 seconds" default (slider / dropdown)

### Step 4 — Create
Single text line _"You will be able to preview your upcoming videos before posting"_ + primary button **`Create Series +`**. On click, validation fires client-side (_"Missing information in step 2: Please enter all details for your selected content type."_).

### Observations
- All 4 steps live on one page as cards, **not separate routes** — low-friction single-form wizard.
- No platform OAuth is required on Free — but is required for any posted destination.
- Tiers don't unlock different art styles / voices based on what was observed — they gate **destinations** and **posting frequency** instead.

---

## 5. Tools — AI Avatar (deep dive)

_The user explicitly asked for a deep-dive here. See §10 for the strategic take-away and how our Slice 3 work mirrors it._

### 5.1 Positioning
- **Route:** `/dashboard/tools/ai-avatar`
- **Nav badge:** `FREE`
- **Title:** `AI AVATAR`
- **Subheading:** _"Add text over a realistic AI Avatar to promote your brand or product. New avatars added daily."_

### 5.2 Left column — controls
1. **Text Overlay** — textarea, **300 char limit**, live-updating counter (`12/300`, `53/300`).
2. **Font Size** — slider, expressed as `% of video height` (default `5%`).
3. **AI Avatars** — responsive grid, **28 avatars per page × 104 pages** on Free tier = **~2,912 unique pre-rendered avatars**. Every avatar is a photorealistic AI-generated influencer-style selfie with a built-in gesture (pointing at where the caption goes, hands clasped, looking surprised, etc.). Pagination controls: `1 · 2 · 3 · 4 · 5 · … · 104 · ›`.
4. **DOWNLOAD MP4** — primary button. Observed state transition: idle → `PROCESSING…` (spinner) → download triggers.

### 5.3 Right column — preview
9:16 vertical aspect. Selected avatar fills the frame; overlay text composites centered over the avatar's midsection in real time as the user types and drags the font-size slider. Selecting a different avatar swaps the image instantly; text stays. No audio. On click of DOWNLOAD MP4, the server composites + encodes; the static pose means the output MP4 is likely ~3 seconds of Ken-Burns / zoom over the same image, not animated lip-sync.

### 5.4 Why this is strategically important
- **Zero-friction lead gen:** anyone signed-in can produce and download a finished, shareable deliverable in under 30 seconds without consuming any credit or picking a plan.
- **Viral output format:** matches the current "influencer-selfie-with-caption" TikTok / Reels template — the highest-converting UGC ad format as of Q1 2026.
- **Moat is the library:** 2,900+ AI avatars is expensive to generate, curate, and filter. Growing daily. No legal risk (no real faces, no likeness waivers).
- **Credit funnel:** free AI Avatar → the user loves the format → they upgrade to Starter/Daily/Hardcore to unlock the *series* workflow that auto-generates similar content on a schedule.

### 5.5 What we built to counter this
See `Slice 3` in the plan file. We went one level further: we offer a **two-tier avatar system**:
- **Stock avatars** (like autoshorts — plug and play, gated by tier) — implemented via [`content/avatars.ts`](content/avatars.ts).
- **Custom Twin Avatar** — a HeyGen-trained digital twin of the user, gated to Creator $79+. No autoshorts equivalent. This is our differentiator.

---

## 6. Tools — Motion 1.0

- **Route:** `/dashboard/tools/motion`
- **Nav badge:** `NEW`
- **Title:** `MOTION 1.0`
- **Subheading:** _"Transform still images into dynamic videos with AI-powered motion. Add an optional end frame to control the final state of your animation."_
- **Feature chips:** Smooth Motion · Multiple Durations · High Quality
- **Inputs:**
  - `Start` (Required) — image upload. Drag/paste/click.
  - `End` (Optional) — image upload.
  - `Motion Prompt` (Optional, 500 chars).
  - `Advanced Settings` — collapsed (not opened in this session).
- **Preview panel:** "No video generated yet" — checklist: _1. Upload start frame · 2. Add motion prompt_.
- **File constraints:** JPG/PNG, 10MB, minimum 300px.
- **Billing:** paid — consumes **Motion Credits** (27 / 62 / 124 per tier). Top-up credits never expire (per billing page).

---

## 7. Guides (`/dashboard/tutorials`)

Heading: `VIDEO GUIDES` · Content: 7 embedded YouTube thumbnails, no in-app player wrapper — direct "Watch on YouTube" overlay.

Titles:
1. Why Am I Getting Low Views?
2. How To Use Custom Topics
3. How To Link Your Social Media Accounts
4. How To Change Your Posting Schedule
5. What is AutoShorts.ai?
6. Brief Overview — Grow With Kaz (influencer-produced)
7. Brief Overview — The AI Hustle (influencer-produced)

Two of the seven are influencer affiliates — affiliate-marketing is a visible growth channel (also reflected in the top-nav `Affiliates` link).

---

## 8. Billing (`/dashboard/billing`)

- **Current Plan block** — shows live usage:
  - `Current Plan: Free`
  - `Max Series: 1`
  - `Frequency: 1`
  - `Video Creation: 1`
  - `Motion Credits: 0 (Included in plan) · 1 (Top off) (Never expire)`
  - `Change Plan` CTA
- **Monthly / Yearly toggle** + tier cards identical to landing pricing section (yearly effective prices: $16/$33/$58).
- **FAQ accordion** — same content as landing.

The "Top-off credits never expire" line is the one explicit guarantee in the UI. Strong de-risking copy that we should steal.

---

## 9. Account (`/dashboard/account`)

Two forms. That's the entire page.
1. **UPDATE EMAIL** — pre-filled with the signed-in Google account's email. _"Note: This will be your login email. Make sure to remember it!"_
2. **CHANGE PASSWORD** — new password + confirm.

No profile photo, no notifications toggles, no data export, no delete account, no session management. Dead-simple — favoring reduction over feature completeness.

---

## 10. Strategic take-aways — what we copy, what we don't

### 10.1 Copy
| Their play | Our implementation |
|---|---|
| **Zero pre-signin onboarding** | Confirmed we're staying aligned — signup is the only gate. |
| **Short post-signin onboarding** — 4 wizard steps on one page | **Slice 1:** reduced our onboarding 5→3 steps (`start/ → voice/ → plan-preview/`). Deleted `platforms/` + `activation/` routes; folded activation persistence into the preview step. |
| **Sample-video grid with view counts** | **Slice 2:** added [`SampleVideoGrid`](components/marketing/SampleVideoGrid.tsx) to landing page. |
| **"First video in 2 min"-style specificity in hero** | **Slice 2:** added _"First video preview in under 2 minutes."_ to `LANDING.HERO.subhead`. |
| **Free standalone tool (AI Avatar)** | **Slice 3:** built two-tier avatar system — AvatarPicker powers both onboarding and `/settings/avatar`. Stock avatars work without any credit; twin training is gated to Creator+. |
| **In-app Guides with tutorial embeds** | **Slice 4:** added `/dashboard/guides` with 5 YouTube tutorial slots + Sidebar nav item. |
| **"Credits never expire"** style reassurance | Backlog — to add to `/settings/billing` copy. |
| **Playful FAQ tone** | Backlog — 2–3 human phrases in our FAQ. |
| **"Email Me Instead" destination** | Deliberate candidate for future slice — removes platform-OAuth friction for trial users. Not in current scope. |

### 10.2 Don't copy
- **Their entertainment topic list** (Scary / Bible / Urban Legends) — wrong audience for us.
- **1-series-per-account hard cap** — conflicts with our weekly rhythm.
- **Posting-frequency pricing axis** — we price on features (platforms, pSEO, voice clone, twin avatar), not cadence.
- **2,900-avatar library** — moat matters but 100–200 curated avatars is the right MVP scale.
- **Heavy affiliate / creator referral model** — could revisit post-product-market-fit; not a Phase 1 priority.

### 10.3 Our differentiation (beyond parity)
- **Custom Twin Avatar** — HeyGen-trained digital twin of the user. Autoshorts has nothing like this. Priced as Creator+ only (see [`lib/utils/avatar-access.ts`](lib/utils/avatar-access.ts)). Grounds the product in the user's identity, not generic AI influencer faces.
- **Domain-presence positioning** — we sell expertise distribution, not faceless content farming. Topic is the user's niche, not "Scary Stories #347".
- **Quality gate** (3 specific questions) — we actively block vague briefs from producing content. Autoshorts doesn't.
- **Weekly rhythm + Manual/Autopilot** — a content operating system, not a one-off video maker.

---

## 11. Raw numbers for quick reference

- **~2,900** stock AI avatars in the library (28 × 104 pages) — most of them daily gesture poses.
- **~30** stock voices (multi-accent, tonal labels).
- **18** art styles.
- **3** aspect ratios.
- **15+** content topic presets.
- **104** pages of avatars (paginated UI).
- **10** series recreations/day allowed per account (abuse guard).
- **120 days** video retention on their servers before auto-delete.
- **300** char limit on AI Avatar text overlay.
- **500** char limit on Motion 1.0 prompt.
- **2–3 min** typical HeyGen-style twin training latency (our expectation, not theirs — autoshorts doesn't expose twins).
- **$19/$39/$69** monthly price points; **$16/$33/$58** effective annual.

---

_Last verified: 2026-04-21. Re-run the capture script before relying on copy-level details for marketing._

---

## 12. CORRECTION — Free Tier Feature Reality (billing dashboard truth)

The landing page lists all 6 features as checkmarks on Free (with a watermark note), implying Free users get everything minus watermark removal. **This is misleading copy.** The `/dashboard/billing` feature comparison shows the full truth:

| Feature | Free | Starter | Daily | Hardcore |
|---|---|---|---|---|
| Auto-Post To Channel | ✗ (disabled) | ✓ | ✓ | ✓ |
| Edit & Preview Videos | ✗ (disabled) | ✓ | ✓ | ✓ |
| HD Video Resolution | ✗ (disabled) | ✓ | ✓ | ✓ |
| Background Music | ✗ (disabled) | ✓ | ✓ | ✓ |
| Voice Cloning | ✗ (disabled) | ✓ | ✓ | ✓ |
| No Watermark | ✗ (has watermark) | ✓ | ✓ | ✓ |
| Motion Credits | 0 | 27 | 62 | 124 |
| Series | 1 | 1 (+add-on) | 1 (+add-on) | 1 (+add-on) |

Free only gets: create 1 video, 1 series, email delivery. **Nothing else.** It's essentially a one-shot demo.

**Series add-on:** Paid tiers show `+` / `−` buttons next to "1 Series" — users can purchase additional series beyond the base 1. Pricing for extra series not publicly disclosed (requires clicking Buy).

**Free tier status:** "Temporarily paused" — shown as a blue info badge. Free plan has been suspended due to bot/spam abuse.

---

## 13. Complete FAQ — Verbatim Answers

_Captured 2026-04-21 via screenshot-click method on `/faq`. All 26 Q&As below._

### 13.1 Series & Videos

**What is a Series?**
A Series in AutoShorts.ai is an automation setup that creates and uploads AI videos on a schedule (like daily or weekly). Each Series runs continuously and generates new videos based on your chosen topic and settings, allowing your channel to run on autopilot. For example, you could create a series called "Scary Stories" that automatically creates content and posts to TikTok and YouTube every day at 9PM EST. Other important things to know: Each series can link to one channel from each platform: TikTok, YouTube, and Instagram. You can delete and create a new series to change your topic (up to 10 times per day).

**Can I create videos in any niche?**
You bet! You can create a series for nearly any topic or niche you want. Either choose from our preset list or use a custom prompt to describe your own.

**What social media platforms do you support posting to?**
We currently support posting to TikTok, YouTube, and Instagram. We are working on adding support for other platforms.

**Are the videos unique?**
Yes! Unlike other services that re-use the same video over and over, we create a new video for each posting in your series. _(answer truncated in capture — core message is confirmed unique generation per post)_

**Can I edit the videos?**
Yes, you can edit basic details such as your video's script, title, and background music at anytime before it is scheduled to post.

**How do custom prompts work?**
Let's say you enter a custom prompt for your series, such as: "Discuss an interesting fact about Genghis Khan". Each video that is created in your series will follow the prompt you gave, while also doing its best to avoid duplicating content from past videos in the same series. So, the first video might be a fact about Genghis Khan's military, the next may be about Genghis Khan's leadership, then his legal code, etc. If you wanted each video in your series to be about something different but still follow the general category of war, then your prompt should be something like: "Please write about a highly interesting event that happened in history related to war." In this case, the first video may be about 300 from Troy, then about The Battle of Gettysburg, etc. If you've ever used ChatGPT before, it's similar to if you gave it your instructions and asked it to write a video script related to that. Each time you ask it, it will come up with something different. The videos in the series behave similarly. Still have questions? Check out our custom prompt guide.

**How many videos can I create per day?**
The number of videos created by each series can be seen on our pricing page. Remember, AutoShorts doesn't focus on individual video creation. Instead, you set up a Series that automatically generates videos on a schedule. Features that render a new video such as making script edits, or changing your series do not count against your plan.

**Why am I not getting many views?**
If your videos are getting very few or even zero views, it's likely that the platform's algorithm thinks your account is a bot. This happens on social media where new accounts that post immediately without a lot of prior engagement can get flagged and suppressed.

_How to Fix It:_
- **Warm up your account before posting** — If your account is brand new, spend at least 48 hours engaging with content. Like, comment, follow relevant accounts, and watch videos to signal that you're a real user.
- **Stop posting for a few days if already suppressed** — If your account has been posting with low views, take a break for 2-3 days and use it normally (like, comment, save posts). Then, gradually start posting again.
- **Ease into posting** — Instead of mass posting right away, start with 1 post per day for the first week. Slowly increase your posting frequency to avoid triggering platform restrictions.
- **Manually upload a few videos first** — Before switching back to auto-posting, try manually uploading a couple of videos. If they get views, this means your account is recovering, and you can resume automation.

_Why Does This Happen?_ Platforms prioritize real user behavior. If an account looks too automated—posting immediately after creation without any interactions—it's likely to be **shadowbanned** (hidden from public feeds). The fix is to gradually build trust with the algorithm by acting like a normal user first.

**Can I replace an existing series with a new one?**
Absolutely! You can delete any current series and start fresh with a new topic or settings anytime (up to 10 times per day). Note: With our free plan, you're able to create one series per account.

**How do I create a video?**
It's important to know that AutoShorts.ai wasn't designed for single video creation, but instead for creating a series of videos on a regular schedule. First you need to create a series. Once you do, the first video in your series will be automatically be queued for creation.

**Can I adjust the video length?**
When creating your series, you can choose between "30 to 60 seconds" or "60 to 90 seconds" length options. For more fine-tuned length control you can manually modify the length of your AI generated script, up to 1,600 characters max.

**Will I get banned?**
Our service has been reviewed and approved by TikTok and YouTube. However, we recommend that brand new channels do not post more than once per day to avoid being flagged as spam; you should "warm" up these accounts. You should also preview your videos before posting to ensure that they are appropriate for your audience.

**Do I own the videos?**
Yes, the videos are yours to do with as you please. You can download them and use them on other platforms, or even sell them to clients.

**Does the platform support multiple languages?**
Yes, we currently support the following languages: English, Arabic, Bulgarian, Czech, Chinese, Danish, Dutch, Estonian, Finnish, French, German, Greek, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean, Malay, Norwegian, Persian, Polish, Portuguese, Russian, Spanish, Swedish, Tagalog, Thai, Turkish, Ukrainian. (**30 languages** total.)

**Are there any types of content that are not allowed?**
We have a NSFW filter on our generative AI models, but we cannot guarantee that all content will be appropriate for all audiences. We are not responsible for any content that is created by our platform.

**Can this make long form content?**
Not at the moment. We focus on short form content, up to 90 seconds in length. We are working on a long form content feature, but it is not currently available.

**What are image credits?**
By default, our AI models generate images for your videos. However, sometimes the images are not perfect, and you may need to generate a replacement image. Image credits allow you to generate new ones. Your plan includes a certain number of image credits that refill on a 30 day rolling basis, but you can purchase more if you need them.

**What are motion credits?**
By default, our AI creates still images for each scene in your video. Motion credits can animate those images. When setting up your series (or in your series settings), you can specify how many motion credits you are okay using per video, and our AI will automatically use them in your video. You can also manually use them in the media editor to add motion to still images. Each plan comes with motion credits that reset each billing cycle, but you can also purchase "top off" credits that never expire from the billing tab. Feel free to setup auto-reload if you'd like to automate top offs.

**Why does the background music stop at 60 seconds?**
Unfortunately, TikTok does not currently allow uploaded music to be longer than 1 minute. Otherwise, you risk your video being muted or taken down. Once TikTok allows this, so will we!

**How long will I have access to my videos?**
You can download past videos in your series for up to 120 days, after which they are removed from our servers. If you delete your series, all associated videos are also deleted, so be sure to download any you want to keep.

### 13.2 Billing

**Is there a free trial?**
You bet your sweet bippy there is. Simply create an account and you can create your first series for free to test a video. No credit card required. Update: We have temporarily suspended the free plan due to abuse from botting / spamming. We will be re-enabling it soon once we implement a better bot detection system.

**Can I cancel at anytime?**
Absolutely. We hate services that purposefully make it difficult to cancel. You can cancel at the click of a button from the dashboard's billing page.

**How does the membership work?**
Beyond the free plan, we offer different tiers of paid memberships. The paid plans remove the watermark and allow you to post more frequently.

**Can I get a refund?**
Unfortunately, we cannot offer refunds as costs incurred for creating AI videos and generating AI photos are extremely high. In turn, our upstream providers do not let us ask for refunds for the GPU processing time used to create your AI videos. This would make it a loss making endeavor for us. During sign up you agree to withhold your right to refund for this reason. You can cancel any time though and your subscription ends.

**Can I upgrade or downgrade my subscription?**
Yes, you can upgrade or downgrade your subscription at any time. Go to the billing tab and select the plan you want to upgrade / downgrade to. If you move to a plan with less series than you currently have, the extra series will be automatically disabled.

**Can I have multiple plans?**
Unfortunately, no. An AutoShorts account can only be on one plan "type" at a time. For example, you can't have one series on the Daily plan and another on the Hardcore plan; they would both need to be on the same plan type. The workaround is to create a separate account if you require multiple plans.

---

## 14. Unit Economics & Cost Structure

### 14.1 Revenue streams
| Stream | How |
|---|---|
| Monthly subscriptions | $19/$39/$69 |
| Annual subscriptions | $190/$390/$690 (effective $16/$33/$58/mo) — 2 months free |
| Series add-on | "+/-" buttons on paid plan cards; pricing not publicly disclosed |
| Image credit top-ups | Purchasable on-demand; refill cycle is 30 days |
| Motion credit top-ups | "Top-off" credits; never expire; auto-reload option available |

### 14.2 Cost structure (inferred from refund policy language)
- **GPU processing** — core cost for video generation. "Costs incurred for creating AI videos and generating AI photos are extremely high." Their upstream AI providers charge per-GPU-second and do not allow refunds, so AutoShorts passes this no-refund policy to users.
- **Image generation** — separate cost from video; billed separately as image credits.
- **Motion animation** — separate credit pool; likely Runway ML or similar image-to-video provider.
- **Storage** — videos are deleted after 120 days (cost control), earlier if user deletes series.
- **Bot abuse** — free plan suspended due to bot exploitation, suggesting the marginal cost per video is meaningful enough to be exploited at scale.

### 14.3 ARPU estimates (rough math)
- If 50% of paying users are on Starter ($19/mo), 30% Daily ($39/mo), 20% Hardcore ($69/mo):
  - Blended monthly ARPU ≈ ($19×0.5) + ($39×0.3) + ($69×0.2) = $9.50 + $11.70 + $13.80 = **~$35/mo**
- Annual plan adoption shifts ARPU down ~16% → ~$29/mo effective
- Add-on credits likely 5–15% revenue uplift
- **Estimated MRR** — not disclosed; no public funding/revenue data found

### 14.4 Pricing axis: cadence, not features
AutoShorts prices on **posting frequency**, not capability. All paid tiers get the same features. This means:
- Low willingness-to-pay users are on Starter (3×/week)
- Power users who want daily/2×daily output pay more
- There's no "premium quality" tier — quality is flat across all tiers
- This is a **usage-based pricing proxy** without true metered billing

### 14.5 No-refund policy wording
The exact refund policy: _"During sign up you agree to withhold your right to refund for this reason."_ — This is aggressive. Users waive refund rights at signup. This is a legal risk vector for them in EU/UK consumer protection jurisdictions.

---

## 15. Blog & SEO Content Strategy

**Blog URL:** `/blog`

### 15.1 Articles published (as of 2026-04-21)
| Title | URL slug | Focus |
|---|---|---|
| How to Warm Up Your TikTok, YouTube, and Instagram account | `/blog/how-to-warm-up-account` | Algorithm trust building |
| Writing Custom Prompts with AutoShorts.ai | `/blog/custom-prompt-guide` | Product education |
| Top Faceless YouTube Channel Ideas 2024 | `/blog/top-faceless-youtube-channel-ideas` | SEO — faceless channel niche |
| AI Video Generator from Text — Revolutionize Your Content Creation | `/blog/ai-video-generator-from-text` | SEO — "AI video generator from text" |
| AI Video Generator — AutoShorts.ai | `/blog/ai-video-generator` | SEO — "AI video generator" |
| AI TikTok Video Generator — Viral Videos on Autopilot | `/blog/ai-tiktok-video-generator` | SEO — "AI TikTok video generator" |
| How to Start a Faceless Video Channel | `/blog/how-to-start-a-faceless-video-channel` | SEO — faceless channel setup |

### 15.2 SEO strategy: Alternatives pages
The footer's "Alternatives" block links to `/alternative/*` pages for each competitor. These are SEO pages that rank on competitor brand searches and funnel that traffic back to AutoShorts. Confirmed routes:
- `/alternative/faceless-video-ai` → vs Faceless.video
- `/alternative/vadoo-ai` → vs Vadoo AI
- `/alternative/nullface-ai` → vs Nullface AI
- `/alternative/smart-short-ai` → vs Smart Short AI
- `/alternative/crayo-ai` → vs Crayo AI
- `/alternative/aivideo-com` → vs AIVideo.com

Also: `/alternative/musicbud-ai` linked externally (affiliate to musicbud.ai).

### 15.3 Custom Prompt Tool
Route: `/dashboard/tools/prompt-writer` — accessible via footer "Custom Prompt Tool" link. Authenticated-only tool (not captured in depth in this session). Likely a free in-app tool to help users craft better custom prompts, reducing the learning curve.

---

## 16. New Routes Discovered (additions to §1 Sitemap)

| Path | Purpose |
|---|---|
| `/chat` | Live chat / contact (replaces `/contact` form) |
| `/google-api-disclosure` | Google OAuth API disclosure (required by Google) |
| `/dashboard/affiliate` | Affiliate signup — generates `?ref=USERNAME` referral URL |
| `/dashboard/tools/prompt-writer` | Custom Prompt Writer tool (free, authenticated) |
| `/blog` | Blog / articles index |
| `/blog/*` | Individual article pages |
| `/alternative/*` | Competitor comparison SEO pages (6 confirmed) |
| `/partners` | Redirects to `/dashboard/affiliate` |

### 16.1 Affiliate program details
- Authenticated users can create a referral URL: `https://autoshorts.ai?ref=USERNAME`
- No commission rate, payout structure, or cookie duration is publicly disclosed anywhere on the site
- The affiliate page is just a URL generator — no dashboard showing clicks, conversions, or earnings visible in this session
- Likely managed via a third-party affiliate platform or manually — intentionally low-friction to sign up

---

## 17. Additional Product Details (newly confirmed)

### 17.1 Language support
30 languages: English, Arabic, Bulgarian, Czech, Chinese, Danish, Dutch, Estonian, Finnish, French, German, Greek, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean, Malay, Norwegian, Persian, Polish, Portuguese, Russian, Spanish, Swedish, Tagalog, Thai, Turkish, Ukrainian.

### 17.2 Script length cap
Maximum AI-generated script length: **1,600 characters** (per FAQ "Can I adjust the video length?"). This controls video duration indirectly.

### 17.3 Platform approval
AutoShorts.ai has been reviewed and approved by TikTok and YouTube for automated posting. This is a significant trust signal — they've passed platform API/partner review. Instagram is supported but approval status not explicitly stated.

### 17.4 Content moderation
NSFW filter in place but explicitly not guaranteed. Legal liability disclaimed — "We are not responsible for any content that is created by our platform." This is standard but important for B2B customers.

### 17.5 Image credits system
- Included in plan, refill every **30 days** (rolling basis)
- Can purchase additional credits on-demand
- Used to regenerate individual images that the AI didn't get right
- Not the same as motion credits

### 17.6 Motion credits system
- Included in plan, reset **each billing cycle**
- "Top off" credits available to purchase → **never expire**
- **Auto-reload** option available (set once, auto-purchases when low)
- Used to animate still images in the video media editor
- Per-video budget configurable in series settings

### 17.7 Video retention policy
Videos available for download for **120 days** from creation. After 120 days, permanently deleted from their servers. Deleting a series immediately deletes all associated videos.

### 17.8 Long form — roadmap signal
Explicitly working on long-form content support (FAQ confirmed). Currently hard cap at 90 seconds.

### 17.9 Series recreation limit
Maximum 10 series deletions + recreations per day (abuse guard). Effectively prevents bulk automated account setup.

---

## 18. Competitive Intelligence Summary — Superior Product Design Targets

Given AutoShorts' strengths and gaps, here is what a superior clone with HeyGen custom avatars should nail:

| AutoShorts Gap | Our Opportunity |
|---|---|
| Free tier is essentially non-functional (1 video, no auto-post, no edit) | Real free trial with 3 videos, auto-post included, no watermark for 7 days |
| 1 series per account hard cap at all tiers | Multiple series at Creator ($79+) |
| No user identity — generic AI avatars only | HeyGen custom twin avatar — user's own face and voice |
| No user expertise — content is generic (Scary Stories, Fun Facts) | Domain-presence content: user's niche, user's voice, user's authority |
| Pricing axis: posting frequency (how much) | Pricing axis: features + identity (how good) |
| No refund, no trial, no grace period | 7-day free trial, cancel anytime, no hard lock-in |
| TikTok + YouTube + Instagram only | YouTube Shorts + Instagram Reels + LinkedIn + X |
| No long form, no pSEO | pSEO article auto-generated from every video |
| Shadowban risk (platform flags bot behavior) | Platform-native quality gate filters vague content |
| 30 languages but same generic content style | User's niche + language = true multilingual authority |
| Motion credits are an upsell friction point | Motion/animation included in all paid tiers |
| No analytics | Intelligence panel after 5+ published videos |
| Affiliate program with zero transparency | Future: transparent partner dashboard with real-time stats |

_Last deep-dive update: 2026-04-21. Session covered: landing, FAQ (all 26 Q&As), billing dashboard, blog index, affiliate page, tools pages._
