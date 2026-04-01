# Finweb Obsidian (Stitch) — Design MD (fonte: MCP)

Fonte: Stitch MCP, projeto `projects/5348035665654884714`, design system `assets/f5b888f99fdd4d94ad2fa4aefbc25610`.

> Este arquivo replica o `designMd` do Stitch para referência e alinhamento com o código.

---

# Design System Specification: The Kinetic Ledger

## 1. Overview & Creative North Star
**North Star: "The Architectural Vault"**

To design for finance is to design for trust; to design for *premium* finance is to design for clarity, composure, and permanence. This design system moves away from the "toy-like" aesthetics of consumer fintech. Instead, it adopts **Architectural Vaulting**—a philosophy where depth is created through material weight and tonal transitions rather than decorative lines.

The system utilizes an editorial approach to data density. We balance high-information environments (transaction ledgers, ticker tapes) with expansive "monumental" white space in headers and hero states. By utilizing intentional asymmetry and shifting background scales, we ensure the UI feels curated, not auto-generated.

---

## 2. Colors & Materiality
We utilize a monochromatic Zinc base to allow the financial "status" colors (Emerald and Rose) to function as functional beacons rather than mere decoration.

### The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning. Structural boundaries must be defined by **Background Shifting**.
* **Example:** A side navigation panel using `surface_container_low` should sit flush against a main content area of `surface`. The "border" is the color change itself.

### Surface Hierarchy & Nesting
Treat the interface as a physical desk of stacked charcoal plates.
* **Base Layer:** `background` (#131315)
* **Sectional Layer:** `surface_container_low` (#1c1b1d)
* **Interactive Cards:** `surface_container_high` (#2a2a2c)
* **Active/Floating Elements:** `surface_container_highest` (#353437)

### The Glass & Texture Rule
For floating modals or dropdowns, use **Glassmorphism**:
* **Background:** `surface_variant` at 60% opacity.
* **Blur:** 20px - 40px backdrop-blur.
* **Signature Gradient:** For primary CTAs, use a linear gradient: `primary` (#4edea3) to `primary_container` (#10b981) at a 135-degree angle. This adds "visual soul" to critical action points.

---

## 3. Typography
We use **Inter** for its neutral, Swiss-inspired legibility. For all numerical data, **Tabular Lining** must be enabled (`font-variant-numeric: tabular-nums`) to ensure decimal points align perfectly in vertical ledgers.

* **Display (lg/md):** Use for "Total Net Worth" or "Account Balance." Letter-spacing should be set to `-0.02em` to create a tight, editorial impact.
* **Headline & Title:** Used for page headers. Always pair a `headline-lg` with a `label-md` uppercase sub-header for an authoritative, hierarchical look.
* **Body (md/lg):** The workhorse for transaction descriptions. Maintain a line-height of 1.5 to ensure readability in data-dense lists.
* **Label (sm):** Used for micro-data (timestamps, metadata). High-contrast `on_surface_variant` ensures these don't compete with primary figures.

---

## 4. Elevation & Depth
In this system, light doesn't just fall; it reveals surface quality.

* **Tonal Layering:** Depth is achieved by "stacking." Place a `surface_container_lowest` card on a `surface_container` background to create a recessed "carved" effect.
* **Ambient Shadows:** For floating elements (Modals/Popovers), use a custom shadow:
  * `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(187, 202, 191, 0.05);`
  * This "Ghost Border" (a 5% opacity `outline_variant`) provides the definition of a line without the visual clutter of a solid stroke.
* **The Depth Map:**
  * *Level 0 (Floor):* `surface`
  * *Level 1 (Card):* `surface_container_low` (Elevation via color)
  * *Level 2 (Hover):* `surface_container_high`
  * *Level 3 (Modal):* `surface_container_highest` + Ambient Shadow.

---

## 5. Components

### Buttons
* **Primary:** Gradient of `primary` to `primary_container`. Text: `on_primary`. Radius: `xl` (1.5rem).
* **Secondary:** Ghost style. Background: `transparent`. Border: 1px `outline_variant` at 20% opacity.
* **Tertiary:** Plain text with `primary` color. Used for "Cancel" or "Back."

### Data Cards & Lists
* **The "No Divider" Rule:** Forbid horizontal lines between transactions. Use `spacing-4` (0.9rem) of vertical white space and subtle background alternates (`surface_container_low` vs `surface_container_lowest`) to distinguish rows.
* **Status Indicators:** Use `primary` (Emerald) for credits/gains and `secondary` (Rose) for debits/losses. Never use these colors for non-functional elements.

### Input Fields
* **Style:** Inset appearance. Background: `surface_container_lowest`.
* **Focus State:** A 1px `primary` (Emerald) border with a 4px `primary` outer glow at 10% opacity.
* **Radii:** Strictly `xl` (1.5rem) to match the overall system language.

### Specialized Component: The Wealth Ticker
A high-density horizontally scrolling component using `label-sm` and `body-sm` typography to display real-time market data or budget progress, utilizing `surface_bright` backgrounds to pop against the dark workspace.

---

## 6. Do's & Don'ts

### Do
* **Do** use tabular numbers for all currency and percentages.
* **Do** leverage `spacing-20` and `spacing-24` for top-level page margins to create a high-end, breathable feel.
* **Do** use `surface_container` shifts to define the sidebar vs. the main stage.

### Don't
* **Don't** use solid black (#000000). Always use the Zinc-tinted `background` (#131315) to maintain professional warmth.
* **Don't** use "Drop Shadows" on standard cards. Use color-stepping instead.
* **Don't** use icons without accompanying text labels unless the action is universally understood (e.g., Close 'X').
* **Don't** use the `rounded-sm` or `none` radii. Every interactive element must be `xl` or `full` to maintain the system's "Soft Industrial" identity.

