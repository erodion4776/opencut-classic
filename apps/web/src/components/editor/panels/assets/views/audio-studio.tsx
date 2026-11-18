"use client";

import { useState } from "react";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { getPropertiesConfig } from "@/components/editor/panels/properties/registry";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { Button } from "@/components/ui/button";
import { mediaTimeFromSeconds, mediaTimeToSeconds } from "@/wasm";

type FadeMode = "in" | "out" | "both";

const FADE_OPTIONS = [
 { value: 0.25, label: "0.25s" },
 { value: 0.5, label: "0.5s" },
 { value: 1, label: "1s" },
 { value: 2, label: "2s" },
];

export function AudioStudioView() {
 const editor = useEditor();
 const mediaAssets = useEditor((state) => state.media.getAssets());
 const { selectedElements } = useElementSelection();
 const [fadeDuration, setFadeDuration] = useState(1);
 const selected = editor.timeline.getElementsWithTracks({ elements: selectedElements });
 const item = selected.length === 1 ? selected[0] : null;

 if (!item || item.element.type !== "audio") {
  return (
   <PanelView title="Audio Studio">
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center">
     <p className="text-sm font-medium">{selectedElements.length === 0 ? "Select an audio clip" : "Select one audio clip at a time"}</p>
     <p className="max-w-60 text-xs text-muted-foreground">Control clip volume, speed and fade automation from one place.</p>
    </div>
   </PanelView>
  );
 }

 const element = item.element;
 const duration = mediaTimeToSeconds({ time: element.duration });
 const safeFadeDuration = Math.min(fadeDuration, duration / 2);
 const baseVolume = typeof element.params.volume === "number" ? element.params.volume : 0;
 const audioConfig = getPropertiesConfig({ element, mediaAssets });
 const audioTab = audioConfig.tabs.find((tab) => tab.id === "audio");
 const speedTab = audioConfig.tabs.find((tab) => tab.id === "speed");
 const hasVolumeAnimation = Boolean(element.animations?.volume);

 const applyFade = (mode: FadeMode) => {
  if (duration <= 0 || hasVolumeAnimation) return;
  const start = -60;
  const end = baseVolume;
  const fadeEnd = safeFadeDuration;
  const fadeStart = duration - safeFadeDuration;
  const points: Array<{ seconds: number; value: number }> =
   mode === "in"
    ? [{ seconds: 0, value: start }, { seconds: fadeEnd, value: end }]
    : mode === "out"
     ? [{ seconds: fadeStart, value: end }, { seconds: duration, value: start }]
     : [
        { seconds: 0, value: start },
        { seconds: fadeEnd, value: end },
        { seconds: fadeStart, value: end },
        { seconds: duration, value: start },
       ];
  editor.timeline.upsertKeyframes({
   keyframes: points.map((point) => ({
    trackId: item.track.id,
    elementId: element.id,
    propertyPath: "volume",
    time: mediaTimeFromSeconds({ seconds: point.seconds }),
    value: point.value,
    interpolation: "linear" as const,
   })),
  });
 };

 return (
  <PanelView title="Audio Studio" contentClassName="pb-6">
   <div className="flex flex-col gap-3">
    <div className="rounded-md border p-3">
     <p className="text-sm font-medium">Selected audio</p>
     <p className="mt-1 truncate text-xs text-muted-foreground">{element.name}</p>
     <p className="mt-2 text-xs text-muted-foreground">Clip length: {duration.toFixed(2)}s · Base gain: {baseVolume.toFixed(1)} dB</p>
    </div>
    {audioTab && <section className="rounded-md border p-2">
     <h3 className="px-2 pt-1 text-xs font-semibold text-muted-foreground">VOLUME</h3>
     {audioTab.content({ trackId: item.track.id })}
    </section>}
    {speedTab && <section className="rounded-md border p-2">
     <h3 className="px-2 pt-1 text-xs font-semibold text-muted-foreground">PLAYBACK SPEED</h3>
     {speedTab.content({ trackId: item.track.id })}
    </section>}
    <section className="rounded-md border p-3">
     <h3 className="text-sm font-semibold">Fade automation</h3>
     <p className="mt-1 text-xs text-muted-foreground">Choose a fade length, then apply native volume keyframes to this clip.</p>
     <div className="mt-3 grid grid-cols-4 gap-2">
      {FADE_OPTIONS.map((option) => <Button key={option.value} size="sm" variant={fadeDuration === option.value ? "default" : "outline"} onClick={() => setFadeDuration(option.value)}>{option.label}</Button>)}
     </div>
     <div className="mt-3 grid grid-cols-1 gap-2">
      <Button variant="outline" disabled={duration <= 0 || hasVolumeAnimation} onClick={() => applyFade("in")}>Fade In</Button>
      <Button variant="outline" disabled={duration <= 0 || hasVolumeAnimation} onClick={() => applyFade("out")}>Fade Out</Button>
      <Button disabled={duration <= 0 || hasVolumeAnimation} onClick={() => applyFade("both")}>Fade In + Out</Button>
     </div>
     {hasVolumeAnimation ? <p className="mt-3 text-xs text-amber-600">This clip already has volume keyframes. Clear its existing volume animation before applying another fade.</p> : <p className="mt-3 text-xs text-muted-foreground">Fades move between -60 dB (near silence) and the clip's current base gain. Existing volume animation is never overwritten.</p>}
    </section>
   </div>
  </PanelView>
 );
}
