# Treasure AI — Pricing Estimator

Single-page calculator (`index.html`, hosted on GitHub Pages from `main`) that estimates:

1. **CDP Platform tier (ICDP / AEP Tiers)** from **P+B Units = Profiles (M) + Behaviors (B)**
2. **AI Suite tier** from **annual AI credits**, plus a headroom buffer

Submissions are written to the **Captured Pricing Inputs** Google Sheet through a Google Apps Script web app (`apps-script/Code.gs`).

The UI follows the Treasure AI 2026 design system: Poppins/Manrope (self-hosted in `assets/fonts/`), the TD2026 palette, the logo, brand line icons (`assets/icons/`), the Dusk gradient field and the suites brand shape. Keep new UI within those tokens: deep blue `#2D40AA` for key numbers, pastel tints for fills, the periwinkle→orchid gradient for primary buttons, soft blue-tinted shadows, and fade-only motion.

## AI credit rates (1 credit =)

| Product | Metric | Units per credit |
|---|---|---|
| AI Foundry | Conversations | 600 |
| Agentic Engage | Email Messages *(or clicks — choose one)* | 1 Million |
| Agentic Engage | Email Clicks *(or sends — choose one)* | 20 Thousand |
| Agentic Engage | SMS Messages | 10 Thousand |
| Agentic Engage | Mobile Push Messages | 10 Million |
| RT Personalization / RT Triggers | RT Profiles (incurred monthly) | 1 Million |
| RT Personalization | Personalization Calls | 10 Million |
| RT Triggers | Incoming RT Trigger Events | 15 Million |
| RT Triggers | Outgoing RT Trigger Activations | 25 Million |
| AI Signals | Predictions – ML Models | 40 Million |
| AI Signals | Predictions – RFM Model | 100 Million |

All rates live in the `RATES` object in `index.html` — update them there.

## Rules

- **Email is charged one way, not both.** Users choose *Emails sent* (1 credit = 1M) or *Email clicks* (1 credit = 20K); only the chosen metric counts. SMS and Mobile Push are added on top.
- **RT Profiles are charged once.** If both RT Personalization and RT Triggers are used, Triggers only pays for profiles above the RT Personalization count.
- **AI Signals is included with AEP.** There are no package selections; credits come from predictions only.
- **AI tier** uses annual credits × (1 + buffer). Buffer options: None / 5% / 10% (default 10%). Above Tier AF the calculator shows "contact Deal Desk".
- **ICDP tier** uses each tier's own P+B Low/High (e.g. Tier 30 = 2,000–2,249.99). Tier 2 is the starting point (Tiers 0 and 1 are not used). Above Tier 40 (6,499.99) the calculator shows "contact Deal Desk".
- **Room left in tier** = tier maximum − value.
- No list prices or discount floors are shown or stored anywhere in this project.

## Sheet submissions

The calculator sends `{ sheet: "New", headers, values }`. The Apps Script writes each value under the matching column header in the **New** tab, adding any missing headers to the right. The **Old** tab is left as is; any request without a `sheet` value still goes to **Old**.

### Deploying the Apps Script (do this before merging calculator changes)

1. Open the Captured Pricing Inputs sheet → **Extensions → Apps Script** (or the Apps Script project that owns the current `SHEET_URL`).
2. Replace the code with `apps-script/Code.gs` and save.
3. Run **`setupNewSheet`** once from the editor (approve the permissions prompt). This writes the column headers into the **New** tab.
4. **Deploy → Manage deployments →** edit the existing web app deployment → **Version: New version → Deploy**. Editing the existing deployment keeps the same `/exec` URL, so `SHEET_URL` in `index.html` doesn't change.
