import { effectsRegistry } from "../registry";
import { blurEffectDefinition } from "./blur";
import { colorAdjustEffectDefinition } from "./color-adjust";
import { sepiaEffectDefinition, grayscaleEffectDefinition, vignetteEffectDefinition } from "./stylize";

const defaultEffects = [blurEffectDefinition, colorAdjustEffectDefinition, sepiaEffectDefinition, grayscaleEffectDefinition, vignetteEffectDefinition];

export function registerDefaultEffects(): void {
	for (const definition of defaultEffects) {
		if (effectsRegistry.has(definition.type)) {
			continue;
		}
		effectsRegistry.register({
			key: definition.type,
			definition,
		});
	}
}
