"use client";

import { useState } from "react";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { Button } from "@/components/ui/button";
import { mediaTimeFromSeconds, mediaTimeToSeconds } from "@/wasm";

const DURATIONS = [0.25, 0.5, 0.75, 1];
type AnimationPreset = "fade" | "pop" | "slide";

export function CaptionAnimationsView() {
	const editor = useEditor();
	const { selectedElements } = useElementSelection();
	const [duration, setDuration] = useState(0.5);

	if (selectedElements.length !== 1) {
		return (
			<PanelView title="Caption Animations">
				<div className="flex min-h-36 flex-col items-center justify-center gap-2 px-4 text-center">
					<p className="text-sm font-medium">
						{selectedElements.length === 0 ? "Select a caption clip" : "Select one caption at a time"}
					</p>
					<p className="max-w-56 text-xs text-muted-foreground">
						Apply an entrance and exit animation to a selected text clip.
					</p>
				</div>
			</PanelView>
		);
	}

	const item = editor.timeline.getElementsWithTracks({ elements: selectedElements })[0];
	if (!item || item.element.type !== "text") {
		return (
			<PanelView title="Caption Animations">
				<p className="px-3 py-8 text-center text-sm text-muted-foreground">
					Select a text or subtitle clip on the timeline.
				</p>
			</PanelView>
		);
	}

	const { element, track } = item;
	const clipDuration = mediaTimeToSeconds({ time: element.duration });
	const animationDuration = Math.min(duration, clipDuration / 2);
	const opacity = typeof element.params.opacity === "number" ? element.params.opacity : 1;
	const scaleX = typeof element.params["transform.scaleX"] === "number" ? element.params["transform.scaleX"] : 1;
	const scaleY = typeof element.params["transform.scaleY"] === "number" ? element.params["transform.scaleY"] : 1;
	const positionY = typeof element.params["transform.positionY"] === "number" ? element.params["transform.positionY"] : 0;

	const applyAnimation = (preset: AnimationPreset) => {
		if (animationDuration <= 0) return;
		const end = element.duration;
		const exitStart = mediaTimeFromSeconds({ seconds: Math.max(animationDuration, clipDuration - animationDuration) });
		const zero = mediaTimeFromSeconds({ seconds: 0 });
		const enterEnd = mediaTimeFromSeconds({ seconds: animationDuration });
		const keyframes = [];

		if (preset === "fade") {
			keyframes.push(
				{ trackId: track.id, elementId: element.id, propertyPath: "opacity", time: zero, value: 0, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "opacity", time: enterEnd, value: opacity, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "opacity", time: exitStart, value: opacity, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "opacity", time: end, value: 0, interpolation: "linear" as const },
			);
		} else if (preset === "pop") {
			keyframes.push(
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.scaleX", time: zero, value: scaleX * 0.72, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.scaleX", time: enterEnd, value: scaleX, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.scaleX", time: exitStart, value: scaleX, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.scaleX", time: end, value: scaleX * 0.72, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.scaleY", time: zero, value: scaleY * 0.72, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.scaleY", time: enterEnd, value: scaleY, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.scaleY", time: exitStart, value: scaleY, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.scaleY", time: end, value: scaleY * 0.72, interpolation: "linear" as const },
			);
		} else {
			keyframes.push(
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.positionY", time: zero, value: positionY + 80, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.positionY", time: enterEnd, value: positionY, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.positionY", time: exitStart, value: positionY, interpolation: "linear" as const },
				{ trackId: track.id, elementId: element.id, propertyPath: "transform.positionY", time: end, value: positionY + 80, interpolation: "linear" as const },
			);
		}
		editor.timeline.upsertKeyframes({ keyframes });
	};

	const conflicts = {
		fade: Boolean(element.animations?.opacity),
		pop: Boolean(element.animations?.["transform.scaleX"] || element.animations?.["transform.scaleY"]),
		slide: Boolean(element.animations?.["transform.positionY"]),
	};

	return (
		<PanelView title="Caption Animations" contentClassName="pb-6">
			<div className="flex flex-col gap-4">
				<div className="rounded-md border p-3">
					<p className="text-sm font-medium">Selected caption</p>
					<p className="mt-1 truncate text-xs text-muted-foreground">{element.name}</p>
					<p className="mt-2 text-xs text-muted-foreground">Entrance and exit: {animationDuration.toFixed(2)}s each</p>
				</div>
				<section className="flex flex-col gap-2">
					<p className="text-xs font-medium text-muted-foreground">Animation duration</p>
					<div className="flex flex-wrap gap-2">
						{DURATIONS.map((seconds) => (
							<Button key={seconds} size="sm" variant={duration === seconds ? "secondary" : "outline"} onClick={() => setDuration(seconds)}>{seconds}s</Button>
						))}
					</div>
				</section>
				<section className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">Entrance + exit presets</p></div>
					<Button variant="outline" className="justify-start" disabled={conflicts.fade || animationDuration <= 0} onClick={() => applyAnimation("fade")}>Fade In + Out</Button>
					<Button variant="outline" className="justify-start" disabled={conflicts.pop || animationDuration <= 0} onClick={() => applyAnimation("pop")}>Pop In + Out</Button>
					<Button variant="outline" className="justify-start" disabled={conflicts.slide || animationDuration <= 0} onClick={() => applyAnimation("slide")}>Slide Up + Down</Button>
				</section>
				{(conflicts.fade || conflicts.pop || conflicts.slide) && (
					<p className="rounded-md border border-amber-500/40 p-3 text-xs text-muted-foreground">
						A preset is disabled when its animation channel already contains keyframes. Existing animation is protected.
					</p>
				)}
				<p className="text-xs text-muted-foreground">These presets write native timeline keyframes. Entrance and exit durations are capped at half the selected clip length. Clear conflicting keyframes before applying another preset.</p>
			</div>
		</PanelView>
	);
}
