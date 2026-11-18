import type { EffectDefinition } from "@/effects/types";
export const COLOR_ADJUST_SHADER = "color-adjust";
function readParam(params: Record<string, unknown>, key: string): number { const value = params[key]; return typeof value === "number" ? value : Number.parseFloat(String(value ?? 0)); }
export const colorAdjustEffectDefinition: EffectDefinition = {
 type: "color-adjust", name: "Color Adjust", keywords: ["color", "colour", "brightness", "contrast", "saturation", "temperature", "grading"],
 params: [
  { key: "brightness", label: "Brightness", type: "number", default: 0, min: -100, max: 100, step: 1 },
  { key: "contrast", label: "Contrast", type: "number", default: 0, min: -100, max: 100, step: 1 },
  { key: "saturation", label: "Saturation", type: "number", default: 0, min: -100, max: 100, step: 1 },
  { key: "temperature", label: "Temperature", type: "number", default: 0, min: -100, max: 100, step: 1 },
 ], renderer: { passes: [{ shader: COLOR_ADJUST_SHADER, uniforms: ({ effectParams }) => ({ u_brightness: readParam(effectParams, "brightness") / 100, u_contrast: readParam(effectParams, "contrast") / 100, u_saturation: readParam(effectParams, "saturation") / 100, u_temperature: readParam(effectParams, "temperature") / 100 }) }] },
};
