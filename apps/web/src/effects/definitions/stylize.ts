import type { EffectDefinition } from "@/effects/types";

export const XTOP_STYLIZE_SHADER = "xtop-stylize";

function buildStylizeEffect({
 type,
 name,
 keywords,
 mode,
}: {
 type: string;
 name: string;
 keywords: string[];
 mode: number;
}): EffectDefinition {
 return {
  type,
  name,
  keywords,
  params: [{
   key: "amount",
   label: "Amount",
   type: "number",
   default: 70,
   min: 0,
   max: 100,
   step: 1,
  }],
  renderer: {
   passes: [{
    shader: XTOP_STYLIZE_SHADER,
    uniforms: ({ effectParams }) => {
     const raw = effectParams.amount;
     const amount = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? 70));
     return { u_amount: Math.max(0, Math.min(100, Number.isFinite(amount) ? amount : 70)) / 100, u_mode: mode };
    },
   }],
  },
 };
}

export const sepiaEffectDefinition = buildStylizeEffect({
 type: "sepia",
 name: "Sepia",
 keywords: ["sepia", "vintage", "warm", "retro"],
 mode: 0,
});

export const grayscaleEffectDefinition = buildStylizeEffect({
 type: "grayscale",
 name: "Black & White",
 keywords: ["black and white", "black", "white", "monochrome", "grayscale", "greyscale"],
 mode: 1,
});

export const vignetteEffectDefinition = buildStylizeEffect({
 type: "vignette",
 name: "Vignette",
 keywords: ["vignette", "cinematic", "edges", "darken"],
 mode: 2,
});
