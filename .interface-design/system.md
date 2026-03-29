# CritiRAG Design System

## Intent

**Who:** Knowledge workers, developers, and enterprise users querying documents and running RAG workflows. Often power users comfortable with dense interfaces.

**What they accomplish:** Upload and process documents, run semantic searches, manage knowledge filters, configure AI providers, and have AI-powered conversations grounded in their document corpus.

**Feel:** Dense like a terminal, precise like a trading floor. Dark by default — this is a tool, not a consumer product. Information-forward, not decorative.

---

## Palette

**Foundation:** Pure black (`#000000`) backgrounds, pure white (`#FFFFFF`) text. No grays in the middle — contrast is intentional and stark.

**Accent:** Amber `#FE9A00` — sole brand color. Used for interactive states, active indicators, focus rings, and CTAs. Pulled from the CritiCo brand identity.

**Semantic:**
- Destructive: `hsl(var(--destructive))` — red family
- Success: green family (system default)
- Muted: `hsl(var(--muted-foreground))` — used for secondary text, placeholders

**CSS variables (from globals.css):**
```css
--background: 0 0% 0%;        /* Pure black */
--foreground: 0 0% 100%;      /* Pure white */
--primary: 38 100% 50%;       /* Amber #FE9A00 */
--primary-foreground: 0 0% 0%;
--card: 0 0% 5%;               /* Near-black card surface */
--border: 0 0% 14.9%;          /* Subtle dark borders */
--muted: 0 0% 14.9%;
--muted-foreground: 0 0% 63.9%;
```

---

## Typography

| Role | Font | Usage |
|------|------|-------|
| Interface text | Inter | Body copy, labels, UI elements |
| Display / Headings | Chivo | Page headings, card titles |
| Code / Monospace | JetBrains Mono | Code blocks, technical values |
| Logo wordmark | IBM Plex Mono | "CritiRAG" in header only |

**Scale:** Follow Tailwind defaults. Headings use `font-display` (Chivo). Body uses `font-sans` (Inter). Code uses `font-mono` (JetBrains Mono).

---

## Surfaces & Depth

Dark mode only. Three surface levels:

| Level | Token | Use |
|-------|-------|-----|
| Base | `bg-background` (#000) | Page background |
| Raised | `bg-card` (~#0D0D0D) | Cards, panels, modals |
| Overlay | `bg-popover` | Dropdowns, tooltips |

Borders use `border-border` (subtle, ~14.9% white). No heavy shadows — separation comes from contrast, not elevation effects.

---

## Component Patterns

### Cards
```tsx
<Card className="bg-card border border-border rounded-lg">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Primary CTA
Amber background, black text:
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
```

### Tabs (settings, onboarding)
shadcn `<Tabs>` with `TabsList` + `TabsTrigger`. Active tab uses amber underline or background.

### Form Inputs
Dark bg, white text, amber focus ring:
```tsx
<Input className="bg-background border-border focus-visible:ring-primary" />
```

### Toast notifications
Using shadcn `useToast()`. Success toasts for knowledge operations. Error toasts with destructive variant.

---

## Motion

All transitions use **Framer Motion**. Standard patterns:

```tsx
// Page entry
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: "easeOut" }}

// Fade only
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.2 }}
```

No decorative animation — motion conveys state change, not delight.

---

## Logo & Branding

- **Component:** `<CritiRagLogo />` from `frontend/components/icons/openrag-logo.tsx` (renders `/critico-logo.svg`)
- **Wordmark:** "CritiRAG" in `font-mono` (IBM Plex Mono), displayed in `<Header />`
- **SVG:** `frontend/public/critico-logo.svg` — CritiCo brand mark

---

## Authentication

Google OAuth via Supabase. Login page shows "Welcome to CritiRAG" with Google sign-in button. IBM watsonx.data OIDC also supported for enterprise users.

---

## Onboarding Flow

Multi-step wizard in `frontend/app/onboarding/`. Provider tabs: Anthropic, OpenAI, IBM WatsonX, Ollama, Google. Each step validates credentials before advancing. Dark card layout with amber accent for active/selected states.

---

## Key Constraints

1. **Never rename backend API identifiers** — `openrag_docs_filter_id`, `connector_type: "openrag_docs"`, and `/api/openrag-docs/refresh` are server-side identifiers that must remain unchanged.
2. **Dark mode only** — `defaultTheme: "dark"` is set in `layout.tsx`. No light mode toggle in the current design.
3. **Amber is the only accent** — do not introduce secondary accent colors. Brand discipline.
4. **IBM Plex Mono is logo-only** — use Inter for all UI text, Chivo for headings.
