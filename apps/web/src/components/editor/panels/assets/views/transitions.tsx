"use client";

import { useState } from "react";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { PanelView } from "./base-panel";
import { Button } from "@/components/ui/button";
import { mediaTimeFromSeconds, mediaTimeToSeconds } from "@/wasm";

const DURATIONS = [0.25, 0.5, 1, 1.5, 2];
type FadePreset = "in" | "out" | "both";

export function TransitionsView() {
 const editor = useEditor();
 useEditor((state) => state.scenes.getActiveSceneOrNull());
 const { selectedElements } = useElementSelection();
 const [fadeDuration, setFadeDuration] = useState(0.5);

 if (selectedElements.length !== 1) {
  return <PanelView title="Fade Transitions"><div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center"><p className="text-sm font-medium">{selectedElements.length === 0 ? "Select a clip to add a fade" : "Select one clip at a time"}</p><p className="max-w-56 text-xs text-muted-foreground">Fade transitions animate a clip's opacity and are saved with the project.</p></div></PanelView>;
 }
 const item = editor.timeline.getElementsWithTracks({ elements: selectedElements })[0];
 if (!item || !["video", "image", "text", "sticker", "graphic"].includes(item.element.type)) {
  return <PanelView title="Fade Transitions"><p className="px-3 py-8 text-center text-sm text-muted-foreground">Select a video, image, text, sticker, or graphic clip.</p></PanelView>;
 }
 const element = item.element;
 const durationSeconds = mediaTimeToSeconds({ time: element.duration });
 const safeDuration = Math.min(fadeDuration, durationSeconds / 2);
 const hasOpacityAnimation = Boolean(element.animations?.opacity);
 const baseOpacity = typeof element.params.opacity === "number" ? element.params.opacity : 1;

 const applyFade = (preset: FadePreset) => {
  if (hasOpacityAnimation || safeDuration <= 0) return;
  const fadeTicks = mediaTimeFromSeconds({ seconds: safeDuration });
  const endTime = element.duration;
  const fadeOutStart = mediaTimeFromSeconds({ seconds: Math.max(0, durationSeconds - safeDuration) });
  const keyframes = [];
  if (preset === "in" || preset === "both") {
   keyframes.push({ trackId: item.track.id, elementId: element.id, propertyPath: "opacity", time: mediaTimeFromSeconds({ seconds: 0 }), value: 0, interpolation: "linear" as const });
   keyframes.push({ trackId: item.track.id, elementId: element.id, propertyPath: "opacity", time: fadeTicks, value: baseOpacity, interpolation: "linear" as const });
  }
  if (preset === "out" || preset === "both") {
   keyframes.push({ trackId: item.track.id, elementId: element.id, propertyPath: "opacity", time: fadeOutStart, value: baseOpacity, interpolation: "linear" as const });
   keyframes.push({ trackId: item.track.id, elementId: element.id, propertyPath: "opacity", time: endTime, value: 0, interpolation: "linear" as const });
  }
  editor.timeline.upsertKeyframes({ keyframes });
 };

 return <PanelView title="Fade Transitions" contentClassName="pb-6"><div className="flex flex-col gap-4">
  <div className="rounded-md border p-3"><p className="text-sm font-medium">Selected clip</p><p className="mt-1 truncate text-xs text-muted-foreground">{element.name} · {element.type}</p></div>
  <section className="flex flex-col gap-2"><p className="text-xs font-medium text-muted-foreground">Fade duration</p><div className="flex flex-wrap gap-2">{DURATIONS.map((seconds) => <Button key={seconds} size="sm" variant={fadeDuration === seconds ? "secondary" : "outline"} onClick={() => setFadeDuration(seconds)}>{seconds}s</Button>)}</div><p className="text-xs text-muted-foreground">Maximum fade length is half the clip duration.</p></section>
  <section className="flex flex-col gap-2"><p className="text-xs font-medium text-muted-foreground">Apply transition</p><Button variant="outline" className="justify-start" disabled={hasOpacityAnimation || safeDuration <= 0} onClick={() => applyFade("in")}>Fade In</Button><Button variant="outline" className="justify-start" disabled={hasOpacityAnimation || safeDuration <= 0} onClick={() => applyFade("out")}>Fade Out</Button><Button className="justify-start" disabled={hasOpacityAnimation || safeDuration <= 0} onClick={() => applyFade("both")}>Fade In + Out</Button></section>
  {hasOpacityAnimation ? <p className="rounded-md border border-amber-500/40 p-3 text-xs text-muted-foreground">This clip already has opacity keyframes. To protect your existing animation, remove or edit those keyframes before applying a fade preset.</p> : <p className="text-xs text-muted-foreground">Fades use the editor's native opacity keyframes, so they are part of the project and render with the clip.</p>}
 </div></PanelView>;
}
