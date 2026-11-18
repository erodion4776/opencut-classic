"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { Button } from "@/components/ui/button";
import { mediaTimeFromSeconds, mediaTimeToSeconds } from "@/wasm";

type SceneCut = { seconds: number; score: number };

function frameDifference(a: Uint8ClampedArray, b: Uint8ClampedArray) {
 let total = 0;
 let count = 0;
 for (let i = 0; i < a.length; i += 4) {
  total += (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])) / 3;
  count++;
 }
 return count ? total / count : 0;
}

async function detectCuts(file: File, sourceStart: number, duration: number, threshold: number, onProgress: (value: number) => void): Promise<SceneCut[]> {
 const url = URL.createObjectURL(file);
 const video = document.createElement("video");
 video.muted = true;
 video.playsInline = true;
 video.preload = "auto";
 video.src = url;
 const waitFor = (event: string) => new Promise<void>((resolve, reject) => {
  const done = () => { cleanup(); resolve(); };
  const fail = () => { cleanup(); reject(new Error("Unable to decode this video.")); };
  const cleanup = () => { video.removeEventListener(event, done); video.removeEventListener("error", fail); };
  video.addEventListener(event, done, { once: true });
  video.addEventListener("error", fail, { once: true });
 });
 try {
  await waitFor("loadedmetadata");
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 18;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas frame analysis is unavailable.");
  const end = Math.min(video.duration, sourceStart + duration);
  const sampleStep = 0.5;
  let previous: Uint8ClampedArray | null = null;
  const cuts: SceneCut[] = [];
  const sampleCount = Math.max(1, Math.floor((end - sourceStart) / sampleStep));
  for (let index = 0; index <= sampleCount; index++) {
   const time = Math.min(end - 0.05, sourceStart + index * sampleStep);
   if (time < 0 || time >= end) continue;
   video.currentTime = time;
   await waitFor("seeked");
   context.drawImage(video, 0, 0, canvas.width, canvas.height);
   const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
   if (previous) {
    const score = frameDifference(previous, pixels);
    if (score >= threshold && time - sourceStart >= 0.5 && end - time >= 0.5) {
     const last = cuts[cuts.length - 1];
     if (!last || time - last.seconds >= 1) cuts.push({ seconds: time - sourceStart, score });
    }
   }
   previous = new Uint8ClampedArray(pixels);
   onProgress(Math.min(100, Math.round((index + 1) / (sampleCount + 1) * 100)));
  }
  return cuts;
 } finally {
  video.removeAttribute("src");
  video.load();
  URL.revokeObjectURL(url);
 }
}

export function SceneStudioView() {
 const editor = useEditor();
 const { selectedElements } = useElementSelection();
 const selected = editor.timeline.getElementsWithTracks({ elements: selectedElements });
 const item = selected.length === 1 ? selected[0] : null;
 const element = item?.element.type === "video" ? item.element : null;
 const asset = element ? editor.media.getAssets().find((entry) => entry.id === element.mediaId) : null;
 const [threshold, setThreshold] = useState(34);
 const [cuts, setCuts] = useState<SceneCut[]>([]);
 const [progress, setProgress] = useState(0);
 const [busy, setBusy] = useState(false);
 const [analyzedId, setAnalyzedId] = useState<string | null>(null);
 const duration = element ? mediaTimeToSeconds({ time: element.duration }) : 0;
 const trimStart = element ? mediaTimeToSeconds({ time: element.trimStart }) : 0;
 const isRetimed = Boolean(element?.retime);
 const totalScenes = cuts.length + 1;
 const sceneSummary = useMemo(() => cuts.map((cut, index) => ({ ...cut, number: index + 2 })), [cuts]);

 const analyze = async () => {
  if (!element || !asset || asset.type !== "video") return;
  setBusy(true);
  setProgress(0);
  setCuts([]);
  try {
   const found = await detectCuts(asset.file, trimStart, duration, threshold, setProgress);
   setCuts(found);
   setAnalyzedId(element.id);
   if (!found.length) toast.info("No strong scene changes found. Try lowering the threshold.");
  } catch (error) {
   toast.error(error instanceof Error ? error.message : "Scene analysis failed.");
  } finally {
   setBusy(false);
  }
 };

 const splitAtDetectedCuts = () => {
  if (!item || !element || analyzedId !== element.id || cuts.length === 0) return;
  const boundaries = [...cuts].sort((a, b) => b.seconds - a.seconds);
  for (const cut of boundaries) {
   editor.timeline.splitElements({
    elements: [{ trackId: item.track.id, elementId: element.id }],
    splitTime: mediaTimeFromSeconds({ seconds: mediaTimeToSeconds({ time: element.startTime }) + cut.seconds }),
   });
  }
  toast.success(`Split the selected clip at ${cuts.length} detected scene boundaries.`);
  setCuts([]);
  setAnalyzedId(null);
 };

 return (
  <PanelView title="Scene Studio" contentClassName="pb-6">
   <div className="flex flex-col gap-3">
    <section className="rounded-md border p-3">
     <h3 className="text-sm font-semibold">Video scene detection</h3>
     <p className="mt-1 text-xs text-muted-foreground">Samples video frames in your browser and finds large visual changes. No video is uploaded for analysis.</p>
     {!item ? <p className="mt-3 text-xs text-muted-foreground">Select one video clip on the timeline.</p> : !element ? <p className="mt-3 text-xs text-muted-foreground">Select a video clip (not an audio, image, or text clip).</p> : !asset || asset.type !== "video" ? <p className="mt-3 text-xs text-muted-foreground">The original video file is not available in this project's media library.</p> : isRetimed ? <p className="mt-3 text-xs text-muted-foreground">Scene detection currently supports clips without speed changes. Reset this clip's speed to normal first.</p> : (
      <>
       <p className="mt-3 truncate text-xs font-medium">{element.name}</p>
       <p className="text-xs text-muted-foreground">Analyzing {duration.toFixed(1)} seconds of the selected clip.</p>
       <div className="mt-4">
        <div className="flex items-center justify-between text-xs"><label htmlFor="scene-threshold">Scene change sensitivity</label><span className="font-medium tabular-nums">{threshold}</span></div>
        <input id="scene-threshold" className="mt-2 w-full accent-primary" type="range" min="12" max="65" step="1" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
        <p className="mt-1 text-[11px] text-muted-foreground">Lower values find more cuts; higher values keep only stronger visual changes.</p>
       </div>
       <Button className="mt-4 w-full" onClick={analyze} disabled={busy}>{busy ? `Analyzing… ${progress}%` : "Detect scenes"}</Button>
       {busy && <div className="h-1.5 overflow-hidden rounded bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>}
      </>
     )}
    </section>
    {analyzedId === element?.id && (
     <section className="rounded-md border p-3">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Detected scenes</h3><span className="text-xs text-muted-foreground">{totalScenes} scenes</span></div>
      {cuts.length ? (
       <>
        <ol className="mt-3 flex flex-col gap-2">
         <li className="flex items-center justify-between rounded border px-2 py-2 text-xs"><span>Scene 1 starts</span><span className="font-mono">0.00s</span></li>
         {sceneSummary.map((cut) => <li key={cut.seconds} className="flex items-center justify-between rounded border px-2 py-2 text-xs"><span>Scene {cut.number} starts</span><span className="font-mono">{cut.seconds.toFixed(2)}s</span><span className="text-muted-foreground">Score {cut.score.toFixed(0)}</span></li>)}
        </ol>
        <Button className="mt-4 w-full" onClick={splitAtDetectedCuts}>Split clip at all scene changes</Button>
        <p className="mt-2 text-[11px] text-muted-foreground">Review the detected boundaries before splitting. The operation uses the editor's native timeline split command and can be undone.</p>
       </>
      ) : <p className="mt-3 text-xs text-muted-foreground">No scene changes matched this sensitivity. Try a lower value.</p>}
     </section>
    )}
   </div>
  </PanelView>
 );
}
