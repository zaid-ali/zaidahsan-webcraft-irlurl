# Product Extraction Notes - irl/URL Agency

## Product Identity

- Name: irl/URL Agency, short irl/URL, slogan "We don't do basic"
- Tagline: creative agency working in idioms of design, brand, fashion, art and product
- Category: Creative agency portfolio / experiential agency site
- Core purpose: showcase agency work, services, philosophy, team, contact
- Tone: bold, editorial, fashion-forward, minimal, luxury streetwear vibe
- Main domain: contact@irl-url.com, HQ Santa Monica CA 2890 Colorado Ave 90404 USA, Operations Hong Kong China

## Pages / Routes / Surfaces

Single route `/` with infinite scroll sections loop:

- intro / welcome
- work (6 items)
- services (7 items + tailor line)
- about
- mission
- purpose
- vision
- team (4 members)
- outro/contact

Shared shell:

- header with logo (SVG sprite #logo 72x50), menuTrigger burger 40x40 with 3 paths, close1/close2 SVGs, slogan, nav #site-navigation
- #root container for WebGL scene
- main #main with 9 sections
- indicator nav (ul + div) showing section progress
- preloader with progress circle + animated logo 93x108 with slash mask animations, fill #fff
- scroll-target div with 1400vh height desktop
- overlays: .case and .profile each with close-btn and .content

Overlay surfaces:

- case study overlay for each work id: beast, pink, dead, nike, akatsuki, drew (6 pages)
- team profile overlay for team ids: travis, bree, frank, damian

## Visual System

Typography:

- Fonts: Pixel (numbers in services), Serif (small labels), pixel.otf sans.ttf serif.ttf in /public/assets/fonts/
- Headings large: work/team list items 80px desktop, services 24px, intro h2 max-width 880px, about large etc.
- h3 side labels left calc(9.2% + 72px), top 8%, transform translateY(20px) skewY(10deg) resting, to 0 when on
- Body font 16px/1 sans, antialiased

Colors:

- Dark background assumed (WebGL scene dark), text white #fff per outro figure svg fill #fff
- Theme color #F37330 from meta theme-color, msapplication TileColor same
- Preloader #??? dark, but uses white text
- Indicator accent?

Layout:

- Desktop breakpoint min-width 1101px
- Padding 8% 4.6% 8% calc(9.2% + 72px) typical
- Mobile modules exist separately
- Scroll mechanism: main sections fixed 100vh top 0, pointer-events none unless .on, scroll-target drives 1400vh
- indicator: ul dots + label div
- SectionController: clamps, direction, scaledProgress = scrollY/max * sections.length, index floor, progress per section, cameraTimer 111ms, contentTimer 3666ms, loops when reaching bottom or top <1
- Indicator label positioning using clamp and offset, hide timers 66ms and 400ms

Motion:

- Transitions cubic-bezier(0.215,0.61,0.355,1) 0.6s for h3, work/team hover after
- Transition 0.3s generic for a/button
- Focus-visible outline 2px solid currentColor offset 4px
- Preloader reveal: body.wait, .loaded, .ready steps with 1111ms + 555ms then removal

## Global Content and Data

Navigation:

- menu links: Work (data-target 1 -> #work), Services (2), About (3), Team (7)
- social: Instagram https://www.instagram.com/irlurl_/, Twitter https://twitter.com/irlurl_, LinkedIn https://www.linkedin.com/company/irl-url/
- contact-info: email mailto:contact@irl-url.com, address Santa Monica
- credit: Website by Mobiquity svg pill + mob path

Intro:

- h3 Wel + bold? "Welcome" styled with b per letters: <b>Wel</b>come
- h2 anim-words data-text "@irl is a [crea]tive agency working in (the idioms) of design, brand, {fashion,} {art} and [product.] We specialize in the creation of (tomorrow's) products and {content.}"
- Visible: "irl/URL is a creative agency working in the idioms of design, brand, fashion, art and product."
- copy columns: "We create and elevate brands and products designed to upend tradition, infiltrate the mainstream and reshape popular culture." + "We work with visionary creators and global tastemakers across industries who move the dial and already have an engaged fanbase. We don't do merch."

Work:

- h3 Work bold Wo
- 6 items:
  - beast MrBeast data-video assets/pages/beast/MrBeast-Swag-drop.mp4 data-desc BUILDING THE PRODUCT ENGINE BEHIND THE BIGGEST CHANNEL ON YOUTUBE
  - pink Pink Palm Puff video assets/pages/pink/irlURL-Pink-Palm-Puff-Disney-Little-Mermaid.mp4 desc BUILDING THE WORLD OF PINK PALM PUFF
  - dead Deadmau5 video assets/pages/dead/Deadmau5xCatEyedBoy-Pop-Up-Tokyo.mp4 desc THE DEADMAU5 X CAT EYED BOY COLLECTION
  - nike Nike x RTFKT video assets/pages/nike/irlURL-Nike-RTFKT-AR-Hoodie.mp4 desc WHERE DIGITAL AND PHYSICAL BECOME ONE
  - akatsuki Akatsuki video assets/videos/akatsuki.mp4 (actually /assets/videos?) desc LIQUID x NARUTO
  - drew Drew House video assets/videos/drew.mp4 desc BRAND, COLLECTIONS & POP-UP STORE

Services:

- h3 Services bold Ser
- 8 li: 1 Brand Creation Development Elevation, 2 Product Design & Dev Licensing Production, 3 Digital Product Creation Development & Implementation, 4 Ethical Sourcing Sustainable Production Solutions, 5 Strategy Ideation Creative Direction, 6 Operations Management, 7 Creative Asset Creation, 8 We custom tailor our services depending on your needs and stage in your journey

About:

- h3 About bold Ab
- h2 data-text "Working at the (intersection) of {physical} and [digital.]" visible "Working at the intersection of physical and digital."
- p.large "We are a team of highly-skilled, experienced, and multidisciplinary professionals with a combined background in design, fashion, art, technology, music, gaming, advertising, marketing, and content creation."
- copy: "We are always on the lookout for new opportunities and disruptive technologies to upend tradition in order to create, elevate and monetize our client's personal brands and products."

Mission:

- h3 Mission bold Mis
- h2 What are we here to do?
- p.large "Our mission is to empower visionary creators, global tastemakers, and forward-thinking brands to create, elevate and commercialize products, and experiences that move culture forward."
- copy "Whether you want to create your own fashion or beauty brand, drop a digital, physical, or phygital clothing collection or product, or create some NFT collectibles; we're here to help you create, produce, distribute and monetize your vision."

Purpose:

- h3 Purpose bold Pur
- h2 Why do we exist?
- p.large "To push the creative and physical boundaries of what brands and products can be. We want to excel, not merely exist. We create brands and experiences that define tomorrow's culture."

Vision:

- h3 Vision bold Vi
- h2 What future do we want to create?
- p.large "To build a virtual and physical world where creators and brands collaborate, compete, and win together. One that leaves its mark in the minds of their audiences and customers, but no trace on earth."

Team:

- h3 Team bold Te
- 4 members: Travis Anderson President video assets/videos/travis.mp4, Bree Morrison Director of Product video assets/videos/bree.mp4, Frank van Rooijen Creative Director video frank.mp4, Damian Estrada Creative Marketing Director damian.mp4

Outro:

- h3 Contact bold Con
- SVG animated 93x108 same as preloader but with 1s morph animations for two side paths plus slash mask rect y -108 to 0
- email contact@irl-url.com, HQ Los Angeles USA, Operations Hong Kong China, social Instagram X LinkedIn

Case Pages Data (from src/data.json pages):

- nike, akatsuki, drew, beast, pink, dead (6) each with cover url title subtitle intro scope p1 p2 and rows columns 1/2/3 with content type image video text
- Detailed extracted above via file listing 190 assets total

Team Data (from data.json team):

- travis President bio long, image assets/images/team/travis.jpg, video travis.mp4, logos new-travis-logos.png
- bree Director Product hidden true initially, bio, image, video, logos bree-logos.jpg
- frank Creative Director, etc.
- damian Creative Marketing Director hidden true

## Complete Content Inventory

See index.html for exact copy.
See data.json for team bios and page content.
CTAs: menuTrigger, logo link to top, nav links, work items click opens case, team items click opens profile, close-btns, contact email mailto, social external links.

## Surface Structure And Components

Home:

- header fixed
- root WebGL container
- main with 9 fixed sections cycling via scroll
- indicator nav fixed showing progress + labels on hover
- preloader overlay full viewport
- case overlay full viewport hidden until opened, slides? opacity managed via body classes case-open case-loading case-ready
- profile overlay similar profile-open profile-loading profile-ready

Case overlay structure:

- button close-btn with close1 close2 svg + hide span close
- div.content containing sections: cover (figure img + div h1 h2), desc (c-text small About the project + p.large p + c-scope small Scope + ul li scope items split by comma), col1/2/3 etc each containing c-image figure img alt Project visual or c-video figure video muted loop controls preload metadata or c-text p innerHTML
- videos controls true
- images alt Project visual, cover alt "{title} cover"

Profile overlay structure:

- left top: h1 name, h2 title, p bio
- left bottom: small Selected clients + img logos alt "{name} client logos"
- right figure video src video poster image muted loop autoplay playsInline

## Interactions and States

- Preloader: updateProgress sets strokeDasharray percentage based on critical assets loading: fonts.ready + /assets/models/map.jpg + /assets/models/cubes/L_1_inflated.glb + R2_Hardware.glb. window.isLoaded false until done, dispatch irlurl:preload-complete. revealApplication adds body.loaded, after 1111ms adds ready removes wait after 555ms removes preloader DOM
- SectionController start(): hide label, started true, scrollTo 0,1, lastScrollY, update true. update(): checks max scrollHeight-innerHeight, loops 0<->max. Calculates scaledProgress, index, sectionProgress. Toggles section class up/out/on. Sets #wrapper class = sections[index].id. Indicator li classes up/on/down, progress span scaleX(sectionProgress). Dispatches progress event with direction + sectionProgress, change event after 111ms, settled after 3666ms. goTo(index, behavior auto) scrolls to index * (max/sections.length) +1
- VisualScene: nudgeFov(direction), setSection(index), setMenuOpen(bool), playWorkVideo(url), stopWorkVideo(), playTeamVideo(url), stopTeamVideo(), initialize(), playIntro()
- Navigation: menuTrigger toggles body.menu-on and scene.setMenuOpen. Logo click preventDefault goTo(0). Nav links data-target goTo(target) close menu. Body.menu-on main opacity 0 important desktop.
- Overlays: work link mouseenter playWorkVideo data-video, mouseleave stopWorkVideo, click openCase id. Similarly team. openCase finds page by id, renders sections via renderCaseSection, replaceChildren, adds case-open case-loading, scrollTop 0, waits images load then remove loading add ready. openProfile similarly builds left/right layout, waits logos image, then video play. close adds loading then after 450ms removes open and loading
- Work hover after element: shows data-desc as pseudo after with opacity 0 translateY(20px) resting, opacity 1 translateY(0) on hover with transition 0.6s cubic-bezier...
- Same for team
- DecorateAnimatedText / revealAnimatedText handling anim-words anim-letters off -> reveal
- Accessibility: focus-visible outline, keyboard scroll? SectionController uses window scroll.

## Responsive Behavior

- Desktop min-width 1101px specific styles above
- Mobile styles exist in mobile-layout.css, mobile-case.css, mobile-profile.css, mobile-ui.css (need extraction later)
- Touch: -webkit-touch-callout none, tap highlight rgba, user-select none globally (but may affect accessibility)
- reduced-motion.css exists for prefers-reduced-motion
- No horizontal overflow expected, body overflow managed

## Assets Used

From asset-manifest and public directory listing 190 assets:

- fonts: pixel.otf, sans.ttf, serif.ttf
- icons.svg (contains logo symbol), apple icons 144,152, favicons 16,32, irlurl icons 192,384,512, thumbnail jpg 960x640, mstile 144
- team images/videos/logos 4 sets
- work images akatsuki 17 jpg + 2 mp4, drew 15 jpg +2 mp4, plus work assets under pages: beast 10 png +3 mp4 + covers, dead many png mp4, nike webp/mp4, pink png mp4, plus general videos akatsuki.mp4 bree.mp4 etc
- models: Logo.glb, cubes 11 glb variants, hdr empty_warehouse_01_1k.hdr, map.jpg
- data.json, asset-manifest.json, build-meta.json, site.json, sw.js etc

## Accessibility Observations

- All images need alt: case images alt Project visual, cover alt "{title} cover", team logos alt "{name} client logos", team poster uses image as poster but not alt for video; profile video no track
- Hide class for visually hidden text: <span class="hide">irl/URL</span> <span class="hide">menu</span> etc
- Menu button aria-controls site-navigation aria-expanded false (needs toggle)
- Nav aria-hidden true initially
- Case/profile close-btn aria-label Close case study / Close team profile
- Indicator li aria-label sectionName, progress span aria-hidden true
- focus-visible outline
- Global user-select none may hinder text selection / screen reader? Contradicts accessibility; but foundation has it
- Reduced motion stylesheet exists
- Videos muted loop autoplay for team, controls for case videos

## Open Questions / Gaps

- Mobile layout specifics not yet extracted (need to read mobile css)
- Exact color tokens beyond #fff, #F37330, dark background need inference from three.js scene
- Cube GLB contents and how they map to sections? VisualScene manages 8 sections mapping to cubes?
- Exact Three.js camera behavior beyond nudgeFov
- Detailed text-effects anim-words/letters timing
- Service worker caching strategy in site.json? precache?
- Does site loop infinitely? Yes scroll loop near top/bottom triggers scrollTo opposite end

## Implementation Sanitization Inventory

- CSS classes like menu-on, case-open, case-loading, case-ready, profile-open etc -> translate to states "menu open", "case study open loading ready"
- IDs like #wrapper naming -> page wrapper region
- JS events like irlurl:preload-complete, change, progress, settled -> product events: preload complete, section change, scroll progress, content settled
- Functions preloadCriticalAssets, revealApplication, initializeNavigation, OverlayController, SectionController, VisualScene, playWorkVideo etc -> product behaviors
- Data attributes data-target, data-video, data-desc -> navigation target index, preview video url, description label
- anim-letters off static, anim-words off -> visual text reveal effect initially hidden then revealed
- close1 close2 burger svg classes -> menu icon states
- .hide -> visually hidden accessible label
- .scroll-target height 1400vh -> scroll track driving section changes
- body.wait, loaded, ready -> loading states
- Uses of fetch / imports / three module importmap -> Three.js 0.??? usage
- window.__irlurl exposed for debugging -> not needed in PRD
