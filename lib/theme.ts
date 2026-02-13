/**
 * Northern Lights theme tokens.
 * Dark neutral base (charcoal/slate) with subtle teal/green/purple accents.
 * Use gradients sparingly: header underline, progress, nav indicator, card hover.
 */
export const theme = {
  // Base surfaces
  surface: {
    base: "hsl(222, 18%, 8%)",      // near-black
    raised: "hsl(222, 16%, 12%)",   // slate
    overlay: "hsl(222, 16%, 14%)",
  },
  // Neutral text
  text: {
    primary: "hsl(210, 20%, 98%)",
    secondary: "hsl(215, 16%, 75%)",
    muted: "hsl(215, 14%, 55%)",
  },
  // Aurora accent gradient stops (use sparingly)
  aurora: {
    teal: "hsl(172, 66%, 45%)",
    green: "hsl(160, 60%, 45%)",
    purple: "hsl(270, 55%, 55%)",
  },
  // Border
  border: {
    default: "hsl(215, 16%, 22%)",
    subtle: "hsl(215, 14%, 18%)",
  },
} as const;

export const auroraGradient = "linear-gradient(90deg, hsl(172, 66%, 45%), hsl(160, 60%, 45%), hsl(270, 55%, 55%))";
export const auroraGradientSubtle = "linear-gradient(135deg, hsl(172, 50%, 35% / 0.4), hsl(270, 45%, 45% / 0.3))";
