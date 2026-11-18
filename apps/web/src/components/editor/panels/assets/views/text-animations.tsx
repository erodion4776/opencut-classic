"use client";

import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { Button } from "@/components/ui/button";
import { mediaTimeFromSeconds, mediaTimeToSeconds } from "@/wasm";

type AnimatedPath =
 | "opacity"
 | "transform.positionX"
 | "transform.positionY"
 | "transform.scaleX"
 | "transform.scaleY"
 | "transform.rotate"
 | "text.reveal";

type MotionPreset = {
 id: string;
 label: string;
 description: string;
 frames: Partial<Record<AnimatedPath, number[]>>;
};

const ENTRANCE_PRESETS: MotionPreset[] = [
 { id: "fade-up", label: "Fade Up", description: "Rise into place while fading in", frames: { opacity: [0, 1], "transform.positionY": [1, 0] } },
 { id: "pop-in", label: "Pop In", description: "Scale up with a soft entrance", frames: { opacity: [0, 1], "transform.scaleX": [0.65, 1], "transform.scaleY": [0.65, 1] } },
 { id: "slide-left", label: "Slide From Left", description: "Move into position from the left", frames: { opacity: [0, 1], "transform.positionX": [-1, 0] } },
 { id: "slide-right", label: "Slide From Right", description: "Move into position from the right", frames: { opacity: [0, 1], "transform.positionX": [1, 0] } },
 { id: "typewriter", label: "Typewriter", description: "Reveal the text character by character", frames: { "text.reveal": [0, 1] } },
 { id: "bounce-in", label: "Bounce In", description: "Drop in and settle with a bounce", frames: { opacity: [0, 1], "transform.positionY": [1, -0.22, 0.08, 0] } },
 { id: "zoom-in", label: "Zoom In", description: "Grow from a tiny title to full size", frames: { opacity: [0, 1], "transform.scaleX": [0.15, 1], "transform.scaleY": [0.15, 1] } },
 { id: "rotate-in", label: "Rotate In", description: "Turn into place while appearing", frames: { opacity: [0, 1], "transform.rotate": [-90, 0], "transform.scaleX": [0.8, 1], "transform.scaleY": [0.8, 1] } },
];

const EXIT_PRESETS: MotionPreset[] = [
 { id: "fade-out", label: "Fade Out", description: "Fade away at the end of the clip", frames: { opacity: [1, 0] } },
 { id: "zoom-out", label: "Zoom Out", description: "Shrink and fade away", frames: { opacity: [1, 0], "transform.scaleX": [1, 0.2], "transform.scaleY": [1, 0.2] } },
 { id: "slide-down-out", label: "Slide Down", description: "Drop down and fade away", frames: { opacity: [1, 0], "transform.positionY": [0, 1] } },
 { id: "rotate-out", label: "Rotate Out", description: "Turn away while fading out", frames: { opacity: [1, 0], "transform.rotate": [0, 90] } },
];

const ANIMATION_DURATION = 0.8;
const FRAME_POSITIONS: Record<number, number[]> = {
 2: [0, 1],
 3: [0, 0.65, 1],
 4: [0, 0.55, 0.8, 1],
};

export function TextAnimationsView() {
 const editor = useEditor();
 useEditor((state) => state.scenes.getActiveSceneOrNull());
 const { selectedElements } = useElementSelection();

 if (selectedElements.length !== 1) {
  return <PanelView title="Text Motion"><div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center"><p className="text-sm font-medium">{selectedElements.length === 0 ? "Select a text clip" : "Select one text clip at a time"}</p><p className="max-w-56 text-xs text-muted-foreground">Choose an entrance or exit animation for a title on the timeline.</p></div></PanelView>;
 }

 const item = editor.timeline.getElementsWithTracks({ elements: selectedElements })[0];
 if (!item || item.element.type !== "text") {
  return <PanelView title="Text Motion"><p className="px-3 py-8 text-center text-sm text-muted-foreground">Text animations work on text clips. Select a text layer to continue.</p></PanelView>;
 }

 const element = item.element;
 const durationSeconds = mediaTimeToSeconds({ time: element.duration });
 const animationDuration = Math.min(ANIMATION_DURATION, durationSeconds);
 const getBase = (path: AnimatedPath): number => {
  const value = element.params[path];
  if (typeof value === "number") return value;
  if (path === "opacity" || path === "text.reveal") return 1;
  if (path === "transform.scaleX" || path === "transform.scaleY") return 1;
  return 0;
 };

 const resolveValue = (path: AnimatedPath, value: number): number => {
  const base = getBase(path);
  if (path === "opacity") return value * base;
  if (path === "text.reveal") return value;
  if (path === "transform.positionX") return base + value * 120;
  if (path === "transform.positionY") return base + value * 90;
  if (path === "transform.scaleX" || path === "transform.scaleY") return value * base;
  if (path === "transform.rotate") return base + value;
  return value;
 };

 const applyPreset = (preset: MotionPreset, direction: "in" | "out") => {
  if (animationDuration <= 0) return;
  const keyframes: Array<{
   trackId: string;
   elementId: string;
   propertyPath: AnimatedPath;
   time: ReturnType<typeof mediaTimeFromSeconds>;
   value: number;
   interpolation: "linear";
  }> = [];
  for (const [path, values] of Object.entries(preset.frames) as Array<[AnimatedPath, number[]]>) {
   const positions = FRAME_POSITIONS[values.length] ?? values.map((_, index) => index / (values.length - 1));
   values.forEach((value, index) => {
    const offset = positions[index] * animationDuration;
    const seconds = direction === "in" ? offset : durationSeconds - animationDuration + offset;
    keyframes.push({
     trackId: item.track.id,
     elementId: element.id,
     propertyPath: path,
     time: mediaTimeFromSeconds({ seconds: Math.max(0, seconds) }),
     value: resolveValue(path, value),
     interpolation: "linear",
    });
   });
  }
  editor.timeline.upsertKeyframes({ keyframes });
 };

 const renderPresets = (presets: MotionPreset[], direction: "in" | "out") => presets.map((preset) => {
  const paths = Object.keys(preset.frames);
  const conflict = paths.some((path) => Boolean(element.animations?.[path]));
  return (
   <div key={preset.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
    <div className="min-w-0">
     <p className="text-sm font-medium">{preset.label}</p>
     <p className="text-xs text-muted-foreground">{preset.description}</p>
    </div>
    <Button size="sm" disabled={conflict || animationDuration <= 0} onClick={() => applyPreset(preset, direction)}>Apply</Button>
   </div>
  );
 });

 return (
  <PanelView title="Text Motion" contentClassName="pb-6">
   <div className="flex flex-col gap-3">
    <div className="rounded-md border p-3">
     <p className="text-sm font-medium">Selected text</p>
     <p className="mt-1 truncate text-xs text-muted-foreground">{element.name}</p>
     <p className="mt-2 text-xs text-muted-foreground">Animation duration: {animationDuration.toFixed(2)}s</p>
    </div>
    <section className="flex flex-col gap-2">
     <div><h3 className="text-sm font-semibold">Entrance animations</h3><p className="text-xs text-muted-foreground">Play when the text clip begins.</p></div>
     {renderPresets(ENTRANCE_PRESETS, "in")}
    </section>
    <section className="mt-2 flex flex-col gap-2">
     <div><h3 className="text-sm font-semibold">Exit animations</h3><p className="text-xs text-muted-foreground">Play during the final part of the text clip.</p></div>
     {renderPresets(EXIT_PRESETS, "out")}
    </section>
    <p className="text-xs text-muted-foreground">Animations use saved project keyframes. Existing animated channels are protected; clear that channel before applying another preset. Typewriter reveal is rendered by the text canvas renderer.</p>
   </div>
  </PanelView>
 );
}
