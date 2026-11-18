"use client";

import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { Button } from "@/components/ui/button";
import { mediaTimeFromSeconds, mediaTimeToSeconds } from "@/wasm";

type AnimatedPath = "opacity" | "transform.positionX" | "transform.positionY" | "transform.scaleX" | "transform.scaleY";
type MotionPreset = {
 id: string;
 label: string;
 description: string;
 values: Partial<Record<AnimatedPath, [number, number]>>;
};

const PRESETS: MotionPreset[] = [
 {
  id: "fade-up",
  label: "Fade Up",
  description: "Rise into place while fading in",
  values: { opacity: [0, 1], "transform.positionY": [1, 1] },
 },
 {
  id: "pop-in",
  label: "Pop In",
  description: "Scale up from a smaller size",
  values: { opacity: [0, 1], "transform.scaleX": [0.65, 1], "transform.scaleY": [0.65, 1] },
 },
 {
  id: "slide-left",
  label: "Slide From Left",
  description: "Enter from the left edge",
  values: { opacity: [0, 1], "transform.positionX": [-1, 1] },
 },
 {
  id: "slide-right",
  label: "Slide From Right",
  description: "Enter from the right edge",
  values: { opacity: [0, 1], "transform.positionX": [1, 1] },
 },
];

const ANIMATION_DURATION = 0.6;

export function TextAnimationsView() {
 const editor = useEditor();
 useEditor((state) => state.scenes.getActiveSceneOrNull());
 const { selectedElements } = useElementSelection();

 if (selectedElements.length !== 1) {
  return <PanelView title="Text Motion"><div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center"><p className="text-sm font-medium">{selectedElements.length === 0 ? "Select a text clip" : "Select one text clip at a time"}</p><p className="max-w-56 text-xs text-muted-foreground">Choose a motion preset to animate a title on the timeline.</p></div></PanelView>;
 }

 const item = editor.timeline.getElementsWithTracks({ elements: selectedElements })[0];
 if (!item || item.element.type !== "text") {
  return <PanelView title="Text Motion"><p className="px-3 py-8 text-center text-sm text-muted-foreground">Text motion presets work on text clips. Select a text layer to continue.</p></PanelView>;
 }

 const element = item.element;
 const durationSeconds = mediaTimeToSeconds({ time: element.duration });
 const animationDuration = Math.min(ANIMATION_DURATION, durationSeconds);
 const transformValue = (key: string, fallback: number) => {
  const value = element.params[key];
  return typeof value === "number" ? value : fallback;
 };
 const baseOpacity = transformValue("opacity", 1);
 const baseX = transformValue("transform.positionX", 0);
 const baseY = transformValue("transform.positionY", 0);
 const baseScaleX = transformValue("transform.scaleX", 1);
 const baseScaleY = transformValue("transform.scaleY", 1);

 const applyPreset = (preset: MotionPreset) => {
  if (animationDuration <= 0) return;
  const keyframes: Array<{
   trackId: string;
   elementId: string;
   propertyPath: AnimatedPath;
   time: ReturnType<typeof mediaTimeFromSeconds>;
   value: number;
   interpolation: "linear";
  }> = [];

  for (const [path, pair] of Object.entries(preset.values) as Array<[AnimatedPath, [number, number]]>) {
   let startValue = pair[0];
   let endValue = pair[1];
   if (path === "opacity") {
    startValue = pair[0] * baseOpacity;
    endValue = pair[1] * baseOpacity;
   } else if (path === "transform.positionX") {
    startValue = pair[0] < 0 ? baseX - 120 : baseX + 120;
    endValue = baseX;
   } else if (path === "transform.positionY") {
    startValue = baseY + 70;
    endValue = baseY;
   } else if (path === "transform.scaleX") {
    startValue = pair[0] * baseScaleX;
    endValue = pair[1] * baseScaleX;
   } else if (path === "transform.scaleY") {
    startValue = pair[0] * baseScaleY;
    endValue = pair[1] * baseScaleY;
   }
   keyframes.push(
    { trackId: item.track.id, elementId: element.id, propertyPath: path, time: mediaTimeFromSeconds({ seconds: 0 }), value: startValue, interpolation: "linear" },
    { trackId: item.track.id, elementId: element.id, propertyPath: path, time: mediaTimeFromSeconds({ seconds: animationDuration }), value: endValue, interpolation: "linear" },
   );
  }
  editor.timeline.upsertKeyframes({ keyframes });
 };

 return (
  <PanelView title="Text Motion" contentClassName="pb-6">
   <div className="flex flex-col gap-3">
    <div className="rounded-md border p-3">
     <p className="text-sm font-medium">Selected text</p>
     <p className="mt-1 truncate text-xs text-muted-foreground">{element.name}</p>
     <p className="mt-2 text-xs text-muted-foreground">Animation duration: {animationDuration.toFixed(2)}s</p>
    </div>
    {PRESETS.map((preset) => {
     const paths = Object.keys(preset.values);
     const conflict = paths.some((path) => Boolean(element.animations?.[path]));
     return (
      <div key={preset.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
       <div className="min-w-0">
        <p className="text-sm font-medium">{preset.label}</p>
        <p className="text-xs text-muted-foreground">{preset.description}</p>
       </div>
       <Button size="sm" disabled={conflict || animationDuration <= 0} onClick={() => applyPreset(preset)}>Apply</Button>
      </div>
     );
    })}
    <p className="text-xs text-muted-foreground">Presets use saved opacity and transform keyframes. Existing animation channels are protected and must be cleared before applying a preset.</p>
   </div>
  </PanelView>
 );
}
