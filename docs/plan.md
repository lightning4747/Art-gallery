# Cinematic Art Gallery — Project Plan

## Vision

A full-viewport, cinematic image gallery inspired by the Awwwards reference.
One image dominates the screen at a time. Drag (or click arrow) to advance:
the active image scales down and flies to the **top-left**, the next one
slides in from the **bottom-right** and expands to full focus. Motion is
physics-driven (spring easing), not linear. Everything feels deliberate and
slow — like flipping through a curated exhibition catalogue.

---

## Aesthetic Direction

| Attribute | Choice |
|---|---|
| Theme | Dark, editorial — near-black canvas, warm ivory text |
| Typography | Display: **`Cormorant Garamond`** (Google Fonts) — aristocratic, refined. Body/UI: **`DM Mono`** — cold, precise. |
| Color | `#0a0a0a` canvas · `#f0ede6` text · `#c8b89a` accent |
| Motion | Framer Motion spring physics: `stiffness 60, damping 20` |
| Mood | Museum late at night — silent, deliberate, immersive |

---

## Interaction Model

```
[prev image]  ←─── drag left ───  [active image]  ─── drag right ───→  [next image]
  top-left                           full viewport                       bottom-right
  small, dim                         sharp, full color                   small, dim
```

- Active image: `~80vw × ~85vh`, centered, slight border frame effect
- Flanking images: `~25vw`, positioned at corners, `opacity: 0.4`, `scale: 0.85`
- Drag threshold: `> 80px` triggers transition
- Keyboard: `← →` arrow keys also trigger transition
- Progress bar: centered bottom, thin `2px` line, grows left→right

### Overlay Text

| Position | Content |
|---|---|
| Top-right | Short thematic phrase (e.g. *"solitude in geometry"*) — changes per image |
| Bottom-left | Image title + subtitle (e.g. *"No. 04 / Tokyo Rain"*) |

Both fade in after image settles (300ms delay post-transition).

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast dev, optimal build |
| Language | TypeScript | Strict types throughout |
| Animation | **Framer Motion** | Spring physics, drag gesture built-in |
| Styling | CSS Modules + CSS Variables | Scoped, no runtime overhead |
| Image formats | PNG, JPEG, WebP | Via `<img>` with `loading="lazy"` |
| Deploy | **AWS S3 + CloudFront** (free tier) | Static hosting, CDN, free 12 months |

---

## Folder Structure

```
art-gallery/
├── public/
│   └── images/                  ← drop your Pinterest images here
│       ├── 01.jpg
│       ├── 02.webp
│       └── ...
├── src/
│   ├── data/
│   │   └── gallery.ts           ← image metadata (path, title, theme text)
│   ├── components/
│   │   ├── Gallery.tsx          ← core gesture + transition logic
│   │   ├── GalleryImage.tsx     ← single image card (active / flanking states)
│   │   ├── ProgressBar.tsx      ← bottom progress indicator
│   │   └── OverlayText.tsx      ← top-right theme text + bottom-left caption
│   ├── hooks/
│   │   └── useKeyNav.ts         ← keyboard arrow key navigation
│   ├── styles/
│   │   ├── global.css           ← CSS variables, reset, fonts
│   │   ├── Gallery.module.css
│   │   ├── GalleryImage.module.css
│   │   ├── ProgressBar.module.css
│   │   └── OverlayText.module.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── plan.md
```

---

## Image Metadata Shape (`gallery.ts`)

```ts
export interface GalleryItem {
  id: string;
  src: string;           // path relative to /public/images/
  title: string;         // e.g. "Tokyo Rain"
  number: string;        // e.g. "No. 04"
  themeText: string;     // top-right overlay, e.g. "solitude in geometry"
  orientation: 'portrait' | 'landscape';
}
```

Both portrait and landscape are supported — active image uses
`object-fit: contain` inside the frame so nothing is cropped.

---

## AWS Deployment (Free Tier, No Domain)

### What you get free for 12 months
- **S3**: 5 GB storage, static website hosting
- **CloudFront**: 1 TB data transfer/month, 10M requests/month

### Steps

```bash
# 1. Build
npm run build          # outputs to dist/

# 2. Create S3 bucket (replace region as needed)
aws s3 mb s3://my-art-gallery-bucket --region us-east-1

# 3. Enable static hosting
aws s3 website s3://my-art-gallery-bucket \
  --index-document index.html \
  --error-document index.html

# 4. Upload build
aws s3 sync dist/ s3://my-art-gallery-bucket --delete

# 5. Make public (bucket policy via console or CLI)
# Add a bucket policy allowing s3:GetObject for Principal: "*"

# 6. (Optional but recommended) Create CloudFront distribution
# Point to S3 bucket origin → you get a *.cloudfront.net URL for free
# CloudFront also handles HTTPS automatically
```

Your gallery URL will be:
- S3 direct: `http://my-art-gallery-bucket.s3-website-us-east-1.amazonaws.com`
- CloudFront: `https://xxxxxxxx.cloudfront.net`

No custom domain needed.

---

## Dev Commands

```bash
# Install
npm install

# Dev server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Type check
npx tsc --noEmit
```

---

## Build Phases

### Phase 1 — Scaffold
- [ ] `npm create vite@latest art-gallery -- --template react-ts`
- [ ] Install: `framer-motion`
- [ ] Set up global CSS variables and fonts
- [ ] Create `gallery.ts` with placeholder entries

### Phase 2 — Core Gallery Component
- [ ] `Gallery.tsx` — manages `activeIndex`, transition direction state
- [ ] `GalleryImage.tsx` — Framer Motion `motion.div` with drag + spring
- [ ] Active / prev / next positional logic
- [ ] Progress bar

### Phase 3 — Overlay Text
- [ ] `OverlayText.tsx` — top-right thematic phrase, bottom-left caption
- [ ] Animate in after image settles (AnimatePresence + delay)

### Phase 4 — Polish
- [ ] Keyboard navigation hook
- [ ] Touch/mobile drag support (Framer handles this natively)
- [ ] Grain overlay texture on canvas
- [ ] Loading state (blur-up or skeleton)
- [ ] Test portrait and landscape images side by side

### Phase 5 — Deploy
- [ ] `npm run build`
- [ ] S3 bucket + static hosting
- [ ] CloudFront distribution
- [ ] Test on CloudFront URL

---

## Image Sourcing Notes

Free, attribution-friendly sources for Pinterest alternatives:
- **Unsplash** (`unsplash.com`) — free, no attribution required
- **Pexels** (`pexels.com`) — free commercial use
- **Pixabay** (`pixabay.com`) — free commercial use

If pulling from Pinterest, ensure images link back to their original
source and confirm the original license. Many Pinterest images are from
Unsplash/Pexels anyway.

Recommended: 8–16 images, mixed portrait and landscape, thematically
coherent (nature + architecture, or monochrome, etc.) so the themeText
overlay feels earned.

---

## Animation Spec (Framer Motion)

```ts
// Spring config — cinematic, not snappy
const spring = {
  type: 'spring',
  stiffness: 55,
  damping: 18,
  mass: 1.2,
};

// Active image
const activeVariant = {
  x: 0, y: 0,
  scale: 1,
  opacity: 1,
  zIndex: 10,
};

// Previous (flies top-left)
const prevVariant = {
  x: '-38vw', y: '-30vh',
  scale: 0.28,
  opacity: 0.45,
  zIndex: 5,
};

// Next (waits bottom-right)
const nextVariant = {
  x: '38vw', y: '30vh',
  scale: 0.28,
  opacity: 0.45,
  zIndex: 5,
};
```

Drag: `dragConstraints` none, `dragElastic: 0.15`,
on `dragEnd` check `offset.x` — if `< -80` go next, if `> 80` go prev.