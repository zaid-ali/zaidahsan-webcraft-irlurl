# irl/URL Agency — Product Requirements Document

## 1. Product Overview

irl/URL is a creative agency portfolio for a studio working in design, brand, fashion, art and product. The site presents positioning, selected work, services, philosophy, team and contact through a single continuous scroll experience backed by an immersive background field.

The central experience on the home route is a fixed full-screen visual field at the back, with nine content chapters that fade and slide in as the visitor scrolls. There are no separate page loads; scrolling drives visual changes and content swaps, with a left-aligned chapter label that animates in and an indicator that shows progress through the chapters. Work and team items open full-screen editorial overlays containing rich imagery, video and long-form text.

The product feels cinematic, minimal and tactile: dark canvas, white ink, accent orange `#F37330`, bold sans with serif and pixel details, large display typography, slow eased transitions, and interaction that rewards hover and scroll.

## 2. Audience and Core Experience

- **Primary audience:**
  - Brands, creators and partners seeking product creation, brand elevation and phygital production.
  - Fans and press exploring case studies across fashion, gaming, music and sport.
  - Prospective team and collaborators reviewing philosophy and credibility.

- **Main user goals:**
  - Quickly understand what irl/URL does and its taste-level through intro copy and tagline.
  - Browse work by name, see short descriptor on hover, open a case study and consume its story with images and video.
  - Review services, about, mission, purpose, vision statements.
  - Meet team members and see individual bios, titles, selected client logos and portrait video.
  - Contact via email and follow social links.

- **Core user flows:**
  - Land on `/` → see loading indicator → welcome chapter appears → scroll down → indicator progresses → work list appears → hover work item reveals descriptor → click opens case overlay → scroll case content → close returns to work.
  - From any section → open menu via top-right trigger → choose `Work`, `Services`, `About`, `Team` → view jumps to that chapter → menu closes.
  - Scroll through services grid → about narrative → mission → purpose → vision → team list → contact outro.
  - From team list → hover profile item → click opens profile overlay with video, bio and logos → close returns to team.
  - From outro → click `contact@irl-url.com` → mail client → click social links → new tab to external profiles.

- **Important emotional and usability qualities:**
  - Continuous and fluid — no hard cuts between chapters, only camera and content morphs.
  - Editorial restraint — sparse copy, large negative space, left-gutter labels, uppercase descriptors.
  - Tactile and product-focused — imagery hero-sized, videos with controls, scope lists explicit.
  - Fast orientation — menu and indicator always give location, logo always returns to top.

## 3. Global Design System

- **Typography:**
  - Display sans for primary headings:
    - Weight `400` for work and team list items.
    - Size `80px` for work/team links on desktop, smaller on narrow viewports.
    - Line height `1` for large links, `1.2em` for service descriptions, `100%` for descriptor hover text.
    - Tracking tight for display.
  - Number markers:
    - Pixel-style font for service numbers.
    - Size `34px`.
  - Label font:
    - Serif for small labels in services.
  - Body:
    - Base `16px` over `1` line height, antialiased, with normalization for headings, paragraphs and lists.
  - Font assets available locally:
    - `/assets/fonts/pixel.otf`
    - `/assets/fonts/sans.ttf`
    - `/assets/fonts/serif.ttf`
  - Heading side labels use bold for first syllable, e.g. `Wel` in `Welcome`, and sit left with top offset.
  - Main chapter headlines have max widths between `520px` and `880px` for readability.

- **Color tokens:**
  - Canvas: near-black dark for background field behind content.
  - Ink primary: white `#ffffff` for headings, menu, body copy and close icons.
  - Ink muted: white at reduced opacity for secondary descriptions.
  - Accent: orange `#F37330` for theme color, tile color, progress and focus.
  - Overlay surface: dark high-opacity black covering viewport for menu, case and profile overlays.

- **Spacing, layout, gutters, radii, borders, shadows, elevation:**
  - Desktop content padding typical `8% 4.6% 8% calc(9.2% + 72px)` for narrative chapters, `8% calc(9.2% + 72px)` for list chapters.
  - Left gutter for side label near `9.2% + 72px` at `8%` from top, fixed when chapter active.
  - Section height `100vh` for each chapter on desktop during scroll progression.
  - Scroll experience uses a tall track many times viewport height to allow chapter-to-chapter progression.
  - List item spacing `60px` bottom margin, centered vertically with top padding.
  - Services grid uses three columns on desktop, each roughly one third width and one third height, with side padding `0 60px 0 50px`, last item wide at two thirds and max `480px`.
  - Radii minimal, squared imagery.
  - Borders subtle `1px` for overlay edges where applied.
  - Shadows soft glow for preloader logo.

- **Shared visual component styles:**
  - Chapter label:
    - Fixed near top left, initially transparent and offset with `translateY(20px)` and slight skew, then opaque and settled when chapter active.
    - Transition `0.6s` with ease `cubic-bezier(0.215,0.61,0.355,1)` and short delay.
    - Uppercase with first syllable bold.
  - Work and team links:
    - Large display size.
    - Descriptor appears below link on hover as uppercase `24px` line `100%`, initially hidden with opacity and vertical offset, revealed on hover with eased transition.
  - Service item:
    - Number absolute left top `34px`.
    - Description `24px` line `1.2em`.
    - Final tailored note `18px` max `480px`.
  - Close button:
    - X formed by two thin `40x4` line graphics.
    - Includes hidden text `close` for assistive tech.
  - Progress circle for preloader uses stroke dash array driven by percentage.

- **Shared product/UI component patterns:**
  - Intro hero: side label plus large headline near middle with bottom copy two columns.
  - List hero: centered list of large typographic links with hover descriptor.
  - Services grid: three-column wrap becoming fewer columns on narrow.
  - Narrative chapter: headline plus large paragraph plus copy columns.
  - Case overlay: cover figure full width with title and subtitle, intro split two columns (about copy plus scope list), then mixed rows of single, double and triple media.
  - Profile overlay: split layout with left text stack and right video figure.
  - Progress indicator: dots plus hover label showing section name.

- **Motion language:**
  - Generic transitions `0.3s` for links and buttons.
  - Chapter label entrance `0.6s` cubic-bezier `(0.215,0.61,0.355,1)`.
  - Menu open fades main content to invisible.
  - Indicator label appears with `66ms` delay on enter, hides with `400ms` fade.
  - Case and profile overlays close with `450ms` animation before disappearing.
  - Narrative content appears with a pause after section change before fully visible, camera updates quickly after scroll.
  - Preloader logo morph animation `1s` with paths morphing and translating, looping `4s` indefinite during loading.
  - Outline focus visible appears with `2px` solid offset `4px`.

- **Global responsive system:**
  - Desktop threshold around `1101px` uses fixed full-viewport chapter system.
  - Below threshold uses natural flow with auto heights, similar content but stacked.
  - Edge padding percentage-based.
  - Touch targets at least `40px` for menu trigger.
  - No horizontal overflow at `320px` on any route.
  - Full-width media scales to container with aspect preserved.

- **Image/media treatment:**
  - Cover images full width of overlay, alt descriptive `"{Title} cover"`.
  - Case images alt `Project visual`.
  - Team images portrait `980x1080`, video `1080x1168`, duration about `12` to `16` seconds, codec `h264`.
  - Work assets mixed `jpg`, `png`, `webp` local under `/assets/pages/` and `/assets/images/work/`.
  - Videos local `mp4` with controls in case, autoplay muted loop for team profiles, muted hover preview in background for work and team lists.
  - Critical visual assets including map texture and cube models are available locally and ready early.

## 4. Global Accessibility Requirements

- **Keyboard reachability:**
  - All interactive controls reachable: logo link, menu trigger, navigation links, work links, team links, case and profile close buttons, indicator dots, social links, email links, videos with controls.

- **Visible focus:**
  - All controls show focus ring `2px solid currentColor` offset `4px` when focused via keyboard.

- **Heading structure:**
  - Case and profile overlays each have one top heading for title.
  - Chapters use side `h3` labels plus large `h2` headlines, order preserved without skipping inside surface.

- **Landmarks:**
  - Persistent header at top.
  - Main landmark for chapters.
  - Navigation landmark for overlay menu.
  - Figure landmark for media with captions where applicable.
  - Menu list for navigation links.

- **Accessible names:**
  - Logo link has hidden text `irl/URL`.
  - Menu trigger has hidden text `menu`, controls site navigation and expands or collapses.
  - Navigation overlay hidden when closed and visible when open, communicated via `aria-hidden`.
  - Case close button label `Close case study`, profile close `Close team profile`.
  - Indicator dots labeled by section name, inner progress indicator hidden from assistive tech.
  - Social links labeled `Instagram`, `Twitter`, `LinkedIn` and contact link labeled `contact@irl-url.com`.
  - Cover images alt `"{Title} cover"`, case images alt `Project visual`, team logos alt `"{Name} client logos"`, team portrait provides poster fallback.
  - Preloader hidden label via visually hidden spans.

- **Alt text:**
  - Meaningful imagery has descriptive alt, decorative icons and separators hidden when appropriate, SVG logos decorative but still have hidden text fallback.

- **Contrast:**
  - White text on dark canvas retains strong contrast for large display and mono labels, service numbers also high contrast.

- **Reduced motion:**
  - When visitor prefers reduced motion, fixed transforms and infinite looping animations reduce, scroll becomes instant, content appears without skew or prolonged stagger.

- **State:**
  - Menu open makes main content invisible and inert.
  - Case and profile overlays reset scroll to top when opened, show loading placeholder until images ready, then show ready content.
  - Indicator active dot reflects current chapter, previous dots marked as passed, upcoming as pending.
  - Preloader removed from view after loading completes.

## 5. Global Content and Data

- **Product name:** `irl/URL` — spelling lower `i`, `r`, `l`, slash, upper `U`, `R`, `L`. Tagline `We don't do basic` with `We` emphasized italic and `basic` bold.

- **Voice:** bold, minimal, fashion and culture-forward, short declarative sentences, uppercase descriptors for work.

- **Navigation:**

| Label      | Destination chapter | Note                       |
| ---------- | ------------------- | -------------------------- |
| `Work`     | `work`              | Scrolls to work list       |
| `Services` | `services`          | Scrolls to services grid   |
| `About`    | `about`             | Scrolls to about narrative |
| `Team`     | `team`              | Scrolls to team list       |

- **Social links:**

| Label       | URL                                         | Opens          |
| ----------- | ------------------------------------------- | -------------- |
| `Instagram` | `https://www.instagram.com/irlurl_/`        | new tab secure |
| `Twitter`   | `https://twitter.com/irlurl_`               | new tab secure |
| `LinkedIn`  | `https://www.linkedin.com/company/irl-url/` | new tab secure |

- **Contact:**

| Field                | Value                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Email                | `contact@irl-url.com` `mailto:contact@irl-url.com`                                                     |
| Headquarters address | `2890 Colorado Ave`, `Santa Monica, CA`, `90404 USA`                                                   |
| Operations           | `Hong Kong`, `China`                                                                                   |
| Credit               | `Website by` linking to `https://www.mobiquity.com` with Mobiquity pill graphic and hidden `Mobiquity` |

- **Work catalog:**

| Id         | Title            | Descriptor                                                          | Preview video                                                        | Cover image                                           |
| ---------- | ---------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| `beast`    | `MrBeast`        | `BUILDING THE PRODUCT ENGINE BEHIND THE BIGGEST CHANNEL ON YOUTUBE` | `/assets/pages/beast/MrBeast-Swag-drop.mp4`                          | `/assets/pages/beast/cover.png`                       |
| `pink`     | `Pink Palm Puff` | `BUILDING THE WORLD OF PINK PALM PUFF`                              | `/assets/pages/pink/irlURL-Pink-Palm-Puff-Disney-Little-Mermaid.mp4` | `/assets/pages/pink/irlURL-Pink-Palm-Puff-Cover3.png` |
| `dead`     | `Deadmau5`       | `THE DEADMAU5 X CAT EYED BOY COLLECTION`                            | `/assets/pages/dead/Deadmau5xCatEyedBoy-Pop-Up-Tokyo.mp4`            | `/assets/pages/dead/irlURL-Deadmau5-Cover.png`        |
| `nike`     | `Nike x RTFKT`   | `WHERE DIGITAL AND PHYSICAL BECOME ONE`                             | `/assets/pages/nike/irlURL-Nike-RTFKT-AR-Hoodie.mp4`                 | `/assets/pages/nike/irlURL-Nike-RTFKT-Cover.webp`     |
| `akatsuki` | `Akatsuki`       | `LIQUID x NARUTO`                                                   | `/assets/videos/akatsuki.mp4`                                        | `/assets/images/work/akatsuki-cover.jpg`              |
| `drew`     | `Drew House`     | `BRAND, COLLECTIONS & POP-UP STORE`                                 | `/assets/videos/drew.mp4`                                            | `/assets/images/work/drew-cover.jpg`                  |

- **Team catalog:**

| Id       | Name                | Title                         | Portrait image                   | Portrait video              | Client logos image                         |
| -------- | ------------------- | ----------------------------- | -------------------------------- | --------------------------- | ------------------------------------------ |
| `travis` | `Travis Anderson`   | `President`                   | `/assets/images/team/travis.jpg` | `/assets/videos/travis.mp4` | `/assets/images/team/new-travis-logos.png` |
| `bree`   | `Bree Morrison`     | `Director of Product`         | `/assets/images/team/bree.jpg`   | `/assets/videos/bree.mp4`   | `/assets/images/team/bree-logos.jpg`       |
| `frank`  | `Frank van Rooijen` | `Creative Director`           | `/assets/images/team/frank.jpg`  | `/assets/videos/frank.mp4`  | `/assets/images/team/new-frank-logos.png`  |
| `damian` | `Damian Estrada`    | `Creative Marketing Director` | `/assets/images/team/damian.jpg` | `/assets/videos/damian.mp4` | `/assets/images/team/damian-logos.jpg`     |

- **Team bios:**

| Member              | Bio exact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Travis Anderson`   | `Travis is a brand-building storyteller and creative entrepreneur with over 25 years experience in the global branding, fashion, streetwear and advertising spaces. He has worked with a number of notable brands, retailers and celebrities and managed successful product launches in the USA, UK, EU, China, Japan, Brazil, Canada, Australia and South Africa. His ability to create brands and brand concepts in addition to an acute eye for quality and aesthetic makes him a versatile thinker and communicator. Travis is driven by collaboration and purpose and enjoys working with a diverse portfolio of clients.`                                                 |
| `Bree Morrison`     | `Bree is an intuitive apparel development specialist with over 18 years experience in the fashion and streetwear space. She has worked across multiple categories creating white label, licensed and branded products. She thrives on ensuring that each product exceeds expectations, and is constantly thinking of ways to improve. Bree is instrumental in taking ideas from concept through to tangible products, committed to building a conducive work environment and pushing for environmental sustainability wherever possible.`                                                                                                                                       |
| `Frank van Rooijen` | `Frank is a multi versatile International Creative Director bringing 20 years of experience in the creative industry. He has worked at some of the most globally renowned ad and digital agencies with some of the world's most iconic brands. His extensive background of expertise includes brand creation, advertising, design, fashion & apparel, esports, omnichannel marketing campaigns, TV, content creation, music production, social media and influencer marketing, emerging tech, and traditional media. As a creative entrepreneur, Frank has co-founded a design studio, a clothing brand, a music production company, and a boutique agency at Ogilvy & Mather.` |
| `Damian Estrada`    | `Damian Estrada is a strong Creative Director, Marketer, and Producer with 10 years experience in the gaming and esports space. His early years were spent covering events and conventions. Shortly after, he landed himself at Team Liquid leading content and building 1UP Studios from the ground up. In recent years he has been heavily focused on brand and apparel marketing, launching collaborations with Marvel, tokidoki, Naruto: Shippuden, and Attack on Titan.`                                                                                                                                                                                                   |

- **Services:**

| Number | Label                                                                             |
| ------ | --------------------------------------------------------------------------------- |
| `1`    | `Brand Creation` `Development` `Elevation`                                        |
| `2`    | `Product Design & Dev.` `Licensing` `Production`                                  |
| `3`    | `Digital Product Creation` `Development &` `Implementation`                       |
| `4`    | `Ethical Sourcing` `Sustainable Production Solutions`                             |
| `5`    | `Strategy` `Ideation` `Creative Direction`                                        |
| `6`    | `Operations Management`                                                           |
| `7`    | `Creative Asset Creation`                                                         |
| —      | `We custom tailor our services depending on your needs and stage in your journey` |

- **Product imagery and media groups:**

| Media group               | Product usage                                                | Representative local assets                                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonts                     | Display numbers and body text                                | `/assets/fonts/pixel.otf`, `/assets/fonts/sans.ttf`, `/assets/fonts/serif.ttf`                                                                                                                                                           |
| Icons                     | Logo symbol and device icons plus thumbnail share image      | `/assets/icons.svg`, `/assets/icons/apple-touch-icon-144x144.png`, `/assets/icons/irlurl-192.png`, `/assets/icons/irlurl-thumbnail.jpg` `960x640`                                                                                        |
| Team portraits and motion | Profile portraits, client logo sheets, portrait videos       | `/assets/images/team/travis.jpg`, `/assets/images/team/new-travis-logos.png`, `/assets/videos/travis.mp4` and equivalents for `bree`, `frank`, `damian` plus `/assets/videos/akatsuki.mp4`, `drew.mp4`                                   |
| Work general              | Case covers and detail photography                           | `/assets/images/work/akatsuki-cover.jpg`, `akatsuki-1.jpg` through `akatsuki-17.jpg`, `drew-cover.jpg` and similar, plus `akatsuki-1.mp4`, `drew-1.mp4`                                                                                  |
| Beast case                | Cover and product stills plus drop and collaboration clips   | `/assets/pages/beast/cover.png`, `MrBeast-13.png`, `MrBeastxNaruto-1.png` … `11.png`, `MrBeast-Swag-drop.mp4`, `MrBeastxShaquille-oneal.mp4`, `collab.mp4`                                                                               |
| Pink case                 | Swim and coastal imagery plus Little Mermaid collaboration   | `/assets/pages/pink/irlURL-Pink-Palm-Puff-Cover3.png`, `Coastal-Classics.png`, `Wings.png`, swim `swim-2.png` … `swim-5.png`, `Disney-Little-Mermaid-photo.png`, `irlURL-Pink-Palm-Puff-Disney-Little-Mermaid.mp4`, `Little-Mermaid.mp4` |
| Dead case                 | Collection overview, Tokyo pop-up and product stills         | `/assets/pages/dead/irlURL-Deadmau5-Cover.png`, `Pop-up-Tokyo.png`, `Product-1.png` … `Product-4.png`, `Slipmat.png`, videos `Deadmau5xCatEyedBoy-Pop-Up-Tokyo.mp4`, `Recap.mp4`, `queue.mp4`                                            |
| Nike x RTFKT case         | Guide hoodie, founders kit, footballverse and CloneX apparel | `/assets/pages/nike/irlURL-Nike-RTFKT-Cover.webp`, `Guide-Hoodie.webp`, `Founders-Kit.webp`, `Footballverse.webp`, `AR-Hoodie-NFC.mp4`, `CloneX.mp4`, `Footballverse.mp4`                                                                |
| Background field models   | Cubes, logo object, environment lighting and map texture     | `/assets/models/Logo.glb`, `/assets/models/cubes/L_1_inflated.glb`, `R2_Hardware.glb`, `R_1_liquid metallic.glb` etc., `/assets/models/hdr/empty_warehouse_01_1k.hdr`, `/assets/models/map.jpg`                                          |

- **Repeated CTA labels:**
  - Close buttons use `close` hidden text plus visible X.
  - Menu uses `menu` hidden label.

## 6. Product Surfaces

### Home — Root Scroll Experience `/`

- Purpose:
  - Present agency identity in single continuous scroll.
  - Allow orientation via chapter labels and progress indicator.

#### Welcome Chapter

- Content:
  - Label `Welcome` with bold `Wel`.
  - Headline `irl/URL is a creative agency working in the idioms of design, brand, fashion, art and product.`
  - Decorative text marker version `@irl is a [crea]tive agency working in (the idioms) of design, brand, {fashion,} {art} and [product.] We specialize in the creation of (tomorrow's) products and {content.}`
  - Paragraphs:
    - `We create and elevate brands and products designed to upend tradition, infiltrate the mainstream and reshape popular culture.`
    - `We work with visionary creators and global tastemakers across industries who move the dial and already have an engaged fanbase. We don't do merch.`
- Structure, components, and assets:
  - Welcome region padded with large percentages, headline near middle with max `880px`, copy at bottom with two columns.
  - Uses large display typography.
- Behavior / states:
  - When chapter becomes active, aside becomes visible, label animates from skewed offset to settled.
  - Text reveal animates words in.
- Responsive behavior:
  - On narrow, columns stack, headline moves near top.
- Accessibility notes:
  - Label and headline announced as region heading.

#### Work Chapter

- Content:
  - Label `Work` with bold `Wo`.
  - List of six links with descriptors:

| Title            | Descriptor                                                          |
| ---------------- | ------------------------------------------------------------------- |
| `MrBeast`        | `BUILDING THE PRODUCT ENGINE BEHIND THE BIGGEST CHANNEL ON YOUTUBE` |
| `Pink Palm Puff` | `BUILDING THE WORLD OF PINK PALM PUFF`                              |
| `Deadmau5`       | `THE DEADMAU5 X CAT EYED BOY COLLECTION`                            |
| `Nike x RTFKT`   | `WHERE DIGITAL AND PHYSICAL BECOME ONE`                             |
| `Akatsuki`       | `LIQUID x NARUTO`                                                   |
| `Drew House`     | `BRAND, COLLECTIONS & POP-UP STORE`                                 |

- Structure, components, and assets:
  - Section `work`, padded similar to welcome, aside centered vertically with top padding, list items large display spaced.
  - Each link pairs with preview video from asset inventory.
- Behavior / states:
  - Hover reveals descriptor below link with fade and slide eased.
  - Hover triggers background preview video playback.
  - Click opens case study overlay for that item.
- Accessibility notes:
  - Links focusable, descriptor not separate focusable element.

#### Services Chapter

- Content:
  - Label `Services` bold `Ser`.
  - Seven numbered services plus tailored sentence `We custom tailor our services depending on your needs and stage in your journey`.
- Structure, components, and assets:
  - Section `services`, flex wrap grid three columns desktop, number marker left top.
- Behavior / states:
  - Content appears when chapter active.

#### About Chapter

- Content:
  - Label `About` bold `Ab`.
  - Headline `Working at the intersection of physical and digital.`
  - Large paragraph `We are a team of highly-skilled, experienced, and multidisciplinary professionals with a combined background in design, fashion, art, technology, music, gaming, advertising, marketing, and content creation.`
  - Copy `We are always on the lookout for new opportunities and disruptive technologies to upend tradition in order to create, elevate and monetize our client's personal brands and products.`
- Structure, components, and assets:
  - Section `about`, aside padding typical, headline max width generous.

#### Mission Chapter

- Content:
  - Label `Mission` bold `Mis`.
  - Headline `What are we here to do?`
  - Large paragraph `Our mission is to empower visionary creators, global tastemakers, and forward-thinking brands to create, elevate and commercialize products, and experiences that move culture forward.`
  - Copy `Whether you want to create your own fashion or beauty brand, drop a digital, physical, or phygital clothing collection or product, or create some NFT collectibles; we're here to help you create, produce, distribute and monetize your vision.`
- Structure, components, and assets:
  - Section `mission`, headline max `720px`, top padding near half viewport.

#### Purpose Chapter

- Content:
  - Label `Purpose` bold `Pur`.
  - Headline `Why do we exist?`
  - Large paragraph `To push the creative and physical boundaries of what brands and products can be. We want to excel, not merely exist. We create brands and experiences that define tomorrow's culture.`
- Structure, components, and assets:
  - Section `purpose`.

#### Vision Chapter

- Content:
  - Label `Vision` bold `Vi`.
  - Headline `What future do we want to create?`
  - Large paragraph `To build a virtual and physical world where creators and brands collaborate, compete, and win together. One that leaves its mark in the minds of their audiences and customers, but no trace on earth.`
- Structure, components, and assets:
  - Section `vision`.

#### Team Chapter

- Content:
  - Label `Team` bold `Te`.
  - Four members: `Travis Anderson`, `Bree Morrison`, `Frank van Rooijen`, `Damian Estrada` with titles:

| Name                | Title revealed on hover       |
| ------------------- | ----------------------------- |
| `Travis Anderson`   | `President`                   |
| `Bree Morrison`     | `Director of Product`         |
| `Frank van Rooijen` | `Creative Director`           |
| `Damian Estrada`    | `Creative Marketing Director` |

- Structure, components, and assets:
  - Section `team`, large list same styling as work.
- Behavior / states:
  - Hover reveals title and triggers background preview video.
  - Click opens profile overlay.

#### Contact Outro Chapter

- Content:
  - Label `Contact` bold `Con`.
  - Animated slash figure size `93x108` with viewBox `0 0 93 108`.
  - Email `contact@irl-url.com` with mailto.
  - Headquarters block `Headquarters:` `Los Angeles` `USA`.
  - Operations block `Operations:` `Hong Kong` `China`.
  - Social links `Instagram`, `X`, `LinkedIn`.
- Structure, components, and assets:
  - Section `outro`, figure absolute near top left of aside, fill white, copy bottom positioned.
- Behavior / states:
  - Figure slashes animate with translation and shape morph over `1s`.
- Accessibility notes:
  - Figure decorative but SVG path animated, email and social reachable.

- Responsive behavior (whole home):
  - Desktop uses fixed full-viewport chapters where tall scroll progression drives swaps; narrow uses natural flow with auto heights.
  - No horizontal overflow at `320px`.

- Accessibility notes (whole home):
  - Only active chapter perceivable as primary content, others inert until active.
  - Page background and accent reflect active chapter identity.
  - Indicator offers alternative navigation.

### Global Header

- Purpose:
  - Provide brand identity and menu access on all chapters.

#### Header Shell

- Content:
  - Logo link with hidden text `irl/URL` and SVG sprite graphic `/assets/icons.svg#logo` size `72x50`.
  - Menu trigger button with hidden text `menu` plus burger graphic `40x40` showing three fragmented horizontal bars, and two close line graphics `40x4` representing X state.
  - Slogan `We don't do basic` where `We` is italic emphasis and `basic` is bold.
- Structure, components, and assets:
  - Fixed at top, full width, logo left, trigger right, slogan small secondary.
- Behavior / states:
  - Logo click returns to first chapter.
  - Menu trigger toggles navigation overlay between closed and open.
  - When open, trigger shows X graphics instead of burger.
- Accessibility notes:
  - Logo link first in tab order, trigger reports expanded state and controls navigation landmark.

#### Navigation Overlay

- Content:
  - Primary links `Work`, `Services`, `About`, `Team` jumping to corresponding chapters.
  - Social links `Instagram`, `Twitter`, `LinkedIn` with external URLs listed in Global Content.
  - Contact block email `contact@irl-url.com` and address `2890 Colorado Ave`, `Santa Monica, CA`, `90404 USA`.
  - Credit `Website by` plus Mobiquity pill graphic linking to `https://www.mobiquity.com` with hidden text `Mobiquity`.
- Structure, components, and assets:
  - Full-screen dark overlay covering viewport when open, with menu list, social list, contact info and credit regions.
- Behavior / states:
  - When closed, overlay hidden and inert, main content visible.
  - When open, main content becomes invisible and inert, overlay visible, focus moves inside.
  - Link click jumps to chapter and closes overlay.
  - External social links open new tab with secure and nofollow attributes.
- Accessibility notes:
  - Overlay hidden communicated via aria-hidden true when closed, false when open.
  - Credit link external secure.

### Progress Indicator

- Purpose:
  - Show location within chapter stack and allow jumping.

#### Indicator Region

- Content:
  - Set of nine dots representing chapters.
  - Hover label showing section name `Welcome`, `Work`, `Services`, `About`, `Mission`, `Purpose`, `Vision`, `Team`, `Contact`.
- Structure, components, and assets:
  - Horizontal or vertical dot strip with adjacent label container.
- Behavior / states:
  - Dots reflect temporal relation to active chapter: passed, current, upcoming.
  - Active dot includes inner progress fill scaling horizontally by chapter scroll progress `0` to `1`.
  - Hover over dot reveals label positioned near dot with clamping to avoid overflow near menu trigger on narrow.
  - Click dot jumps to that chapter.
  - Label show moves quickly, hides with fade.
- Accessibility notes:
  - Dots labeled by section name, inner progress hidden from assistive tech.

### Preloader

- Purpose:
  - Block view until critical assets and fonts ready and communicate progress.

#### Loading Overlay

- Content:
  - Progress circle SVG indicating percentage.
  - Logo graphic `93x108` with animated morph.
- Structure, components, and assets:
  - Full viewport centered column, dark matching canvas.
- Behavior / states:
  - Initially page shows waiting state with content hidden behind preloader.
  - As critical assets including map texture and cube models plus fonts become available, progress indicator updates percentage.
  - On complete, loading overlay transitions, then the page becomes ready after a short delay about one second, and the preloader fades and hides.
- Accessibility notes:
  - Once removed, not present in accessibility tree.

### Background Visual Field

- Purpose:
  - Provide ambient immersive field behind chapters.

#### Stage and Scene

- Content:
  - No text, purely visual.
- Structure, components, and assets:
  - Background canvas behind main content plus environment map `/assets/models/hdr/empty_warehouse_01_1k.hdr` and models:

| Model asset                                    |
| ---------------------------------------------- |
| `/assets/models/Logo.glb`                      |
| `/assets/models/cubes/L_1_inflated.glb`        |
| `/assets/models/cubes/L_3_suzanne2.glb`        |
| `/assets/models/cubes/L_4_art cube.glb`        |
| `/assets/models/cubes/L_5_rubicks.glb`         |
| `/assets/models/cubes/L_6_Sci-Fi.glb`          |
| `/assets/models/cubes/L_8_liquid plastic.glb`  |
| `/assets/models/cubes/R2_Hardware.glb`         |
| `/assets/models/cubes/R_1_liquid metallic.glb` |
| `/assets/models/cubes/R_5_inflated.glb`        |
| `/assets/models/cubes/R_6_Speaker.glb`         |
| `/assets/models/cubes/R_7_minecraft.glb`       |
| `/assets/models/cubes/R_8_concret.glb`         |
| `/assets/models/map.jpg`                       |

- Behavior / states:
  - Scene initializes and plays intro after preloader completes.
  - Chapter change updates camera and cube arrangement.
  - Scroll direction nudges field of view slightly.
  - Hovering work or team items triggers preview video playback mapped in scene.
  - Menu open dims scene.
  - When browser tab becomes hidden, rendering pauses, resumes on return.
- Accessibility notes:
  - Decorative, hidden from assistive tech, equivalent meaning provided via chapter copy.

### Case Study Overlay

- Purpose:
  - Show full editorial case study for selected work.

#### Cover Region

- Content:
  - Figure with cover image and alt `"{Title} cover"`.
  - Title heading and subtitle descriptor.
  - Titles and descriptors per case as per work catalog table.
- Structure, components, and assets:
  - Top figure full width with title and subtitle below or over.
- Behavior / states:
  - Appears over main experience when work item selected.

#### Intro Region

- Content:
  - Small label `About the project`.
  - Two paragraphs per case from editorial data.
  - Small label `Scope` plus list of scope items split from comma-separated list.

| Case       | Paragraph 1 start                                                                   | Paragraph 2 start                                       | Scope sample                                                           |
| ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `beast`    | `For MrBeast, we plugged in as the product engine...`                               | `Our partnership was about giving...`                   | `Product Design & Development`, `Licensing & Brand Collaborations` ... |
| `pink`     | `For Pink Palm Puff we plug in as an extension...`                                  | `With over 35 years...`                                 | `Product Design & Development`, `Swimwear Design & Production` ...     |
| `dead`     | `For Deadmau5 we arranged a brand collaboration...`                                 | `Two brands already at the top...`                      | `Ideation`, `Creative Direction`, `Licensing` ...                      |
| `nike`     | `For Nike and RTFKT we plugged in as apparel innovation...`                         | `Our work spans two connected worlds...`                | `Apparel Innovation`, `Product Design & Development` ...               |
| `akatsuki` | `For Team Liquid we arranged a brand collaboration with Naruto Shippuden...`        | `For Team Liquid's sophomore Naruto release...`         | `Ideation`, `Creative Direction`, `Licensing` ...                      |
| `drew`     | `This was a project that two of our co-founders worked on in their own capacity...` | `As a starting point, we created a visual direction...` | `Ideation`, `Creative Direction`, `Brand Creation` ...                 |

- Structure, components, and assets:
  - Split two columns: explanatory text left, scope list right.

#### Media Rows

- Content:
  - Repeated rows with one, two or three columns containing mixed media:

| Type  | What appears                                                       | Assets                                                 |
| ----- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| Image | Full-bleed photograph with alt `Project visual`                    | Local under `/assets/pages/` or `/assets/images/work/` |
| Video | Short loop with controls, muted looping, showing product in motion | Local `mp4` under same paths                           |
| Text  | Paragraph with narrative copy from case editorial                  | —                                                      |

- Exact assets per case match inventory in Global Content asset group.
- Structure, components, and assets:
  - Rows alternate tight spacing, flush spacing, uneven widths for visual rhythm.
  - Images max `100%` width, videos with controls.
- Behavior / states:
  - On open, scroll position reset to top, shows loading placeholder until images ready then ready content.
  - Close button labeled `Close case study` returns to work chapter after short animation.
- Responsive behavior:
  - On narrow viewports columns stack single file, videos remain with controls, images full width.
- Accessibility notes:
  - Close button focusable first in overlay, keyboard closes on activation, images have alt, videos have controls and are muted.

### Team Profile Overlay

- Purpose:
  - Show individual team member detail.

#### Profile Content

- Content:
  - Name heading and title subheading.
  - Bio paragraph exact as per team bios table.
  - Lower label `Selected clients` plus logo sheet image with alt `"{Name} client logos"`.
  - Side portrait video with poster image.
- Structure, components, and assets:
  - Two-column layout: left contains name, title, bio top and client logos bottom; right contains figure with video.
  - Video muted loop autoplay inline.
- Behavior / states:
  - On open, scroll reset to top, waits for logo sheet image then shows ready and plays video.
  - Close button labeled `Close team profile` returns to team chapter after short animation.
- Accessibility notes:
  - Close button reachable, video provides poster image fallback, logos alt descriptive.

## 7. Acceptance Criteria

### Home Root Scroll

- Landing at `/` shows loading overlay with progress circle and logo graphic, then reveals welcome chapter with label `Welcome` and headline `irl/URL is a creative agency working in the idioms of design, brand, fashion, art and product.` plus two intro paragraphs about elevating brands and working with tastemakers.

- Scrolling proceeds through chapters `Work`, `Services`, `About`, `Mission`, `Purpose`, `Vision`, `Team`, `Contact` in order, with side labels animating from offset to settled.

- When scroll reaches bottom it wraps to top, and scrolling upward beyond top wraps to bottom, preserving infinite loop feel.

### Header and Navigation

- Logo link showing graphic `/assets/icons.svg#logo` size `72x50` returns to first chapter when activated.

- Menu trigger toggles full-screen overlay, reports expanded state, and main content becomes invisible when overlay open.

- Navigation links `Work`, `Services`, `About`, `Team` jump to correct chapters and close overlay.

- Social links point to Instagram `https://www.instagram.com/irlurl_/`, Twitter `https://twitter.com/irlurl_` and LinkedIn `https://www.linkedin.com/company/irl-url/` and open new tab securely.

- Credit `Website by` links to `https://www.mobiquity.com` with hidden text `Mobiquity`.

### Indicator

- Indicator shows nine dots, active dot inner fill scales horizontally with scroll progress within chapter.

- Hover over dot reveals section name label positioned near dot, clamped to avoid overflow.

- Click dot jumps to corresponding chapter.

### Work and Case Studies

- Work chapter shows six items `MrBeast`, `Pink Palm Puff`, `Deadmau5`, `Nike x RTFKT`, `Akatsuki`, `Drew House` with uppercase descriptors on hover.

- Hover over work item triggers background preview video from `/assets/pages/` or `/assets/videos/` and descriptor appears with fade and slide.

- Click opens case overlay with close label `Close case study`.

- Cover region shows image with alt `"{Title} cover"` plus title and subtitle matching descriptor.

- Intro region shows `About the project` plus two paragraphs and `Scope` list with items split.

- Media rows contain expected local images and videos for each case, images alt `Project visual`, videos have controls muted loop.

- Closing returns to work chapter.

### Services and Philosophy

- Services grid shows seven numbered services plus tailoring sentence.

- About shows `Working at the intersection of physical and digital.` plus large paragraph about multidisciplinary professionals and copy about opportunities.

- Mission shows `What are we here to do?` plus empowerment mission statement and copy about fashion, phygital, NFT.

- Purpose shows `Why do we exist?` plus push boundaries copy.

- Vision shows `What future do we want to create?` plus virtual and physical world copy.

### Team and Profile

- Team chapter lists four members `Travis Anderson`, `Bree Morrison`, `Frank van Rooijen`, `Damian Estrada` with titles revealed on hover.

- Hover plays team video in background.

- Click opens profile overlay with close `Close team profile`, name heading, title subheading, exact bio text, label `Selected clients` with logo image alt containing member name, side video poster matching portrait image and autoplay muted loop.

### Contact and Outro

- Outro shows animated figure `93x108` with slash morph animation, email `contact@irl-url.com` mailto, headquarters `Los Angeles` `USA`, operations `Hong Kong` `China`, social `Instagram`, `X`, `LinkedIn`.

### Accessibility and Responsive

- All interactive elements reachable via keyboard, focus ring visible `2px solid currentColor` offset `4px`.

- Menu button indicates controls and expanded state, navigation overlay reports hidden when closed.

- Overlays expose close buttons with correct labels, indicator dots labeled by section name.

- No horizontal overflow at `320px`, images responsive max `100%`.

- Reduced motion preference reduces skew and looping animations, scroll instant.

### Assets and Visuals

- Fonts loaded from `/assets/fonts/pixel.otf`, `/assets/fonts/sans.ttf`, `/assets/fonts/serif.ttf`.

- Background visual field uses models `/assets/models/cubes/*.glb` plus HDR `/assets/models/hdr/empty_warehouse_01_1k.hdr` and texture `/assets/models/map.jpg`.

- Case, team and page assets remain local under `/assets/` with no external hotlinking.

- Theme color ` #F37330` appears in metadata.
