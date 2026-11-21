import type { EffectDefinition } from "@/effects/types";

export const XTOP_STYLIZE_SHADER = "xtop-stylize";

function buildStylizeEffect({
 type, name, keywords, mode, defaultAmount = 70,
}: {
 type: string; name: string; keywords: string[]; mode: number; defaultAmount?: number;
}): EffectDefinition {
 return {
  type, name, keywords,
  params: [{ key: "amount", label: "Amount", type: "number", default: defaultAmount, min: 0, max: 100, step: 1 }],
  renderer: { passes: [{
   shader: XTOP_STYLIZE_SHADER,
   uniforms: ({ effectParams }) => {
    const raw = effectParams.amount;
    const amount = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? defaultAmount));
    return { u_amount: Math.max(0, Math.min(100, Number.isFinite(amount) ? amount : defaultAmount)) / 100, u_mode: mode };
   },
  }] },
 };
}

export const sepiaEffectDefinition = buildStylizeEffect({ type: "sepia", name: "Sepia", keywords: ["sepia", "vintage", "warm", "retro"], mode: 0 });
export const grayscaleEffectDefinition = buildStylizeEffect({ type: "grayscale", name: "Black & White", keywords: ["black and white", "black", "white", "monochrome", "grayscale", "greyscale"], mode: 1 });
export const vignetteEffectDefinition = buildStylizeEffect({ type: "vignette", name: "Vignette", keywords: ["vignette", "cinematic", "edges", "darken"], mode: 2 });
export const chromaticAberrationEffectDefinition = buildStylizeEffect({ type: "chromatic-aberration", name: "Chromatic Aberration", keywords: ["chromatic", "rgb split", "color fringing", "glitch", "lens"], mode: 3, defaultAmount: 35 });
export const filmGrainEffectDefinition = buildStylizeEffect({ type: "film-grain", name: "Film Grain", keywords: ["grain", "noise", "film", "texture", "analog"], mode: 4, defaultAmount: 25 });
export const glitchEffectDefinition = buildStylizeEffect({ type: "glitch", name: "Digital Glitch", keywords: ["glitch", "digital", "distortion", "vhs", "datamosh"], mode: 5, defaultAmount: 35 });
export const lightLeakEffectDefinition = buildStylizeEffect({ type: "light-leak", name: "Light Leak", keywords: ["light leak", "flare", "sunlight", "warm glow", "cinematic"], mode: 6, defaultAmount: 40 });
