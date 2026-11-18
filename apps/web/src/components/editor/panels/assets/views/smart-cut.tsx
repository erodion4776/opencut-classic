"use client";

import { useMemo, useState } from "react";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { Button } from "@/components/ui/button";
import { mediaTimeToSeconds } from "@/wasm";

type SilenceRange = { start: number; end: number; duration: number };

function detectSilence(buffer: AudioBuffer, thresholdDb: number, minimumDuration: number): SilenceRange[] {
 const sampleRate = buffer.sampleRate;
 const frameSize = Math.max(1, Math.floor(sampleRate * 0.1));
 const threshold = Math.pow(10, thresholdDb / 20);
 const ranges: SilenceRange[] = [];
 let silenceStart = -1;
 for (let offset = 0; offset < buffer.length; offset += frameSize) {
  const end = Math.min(buffer.length, offset + frameSize);
  let sumSquares = 0;
  let count = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
   const samples = buffer.getChannelData(channel);
   for (let i = offset; i < end; i++) { const sample = samples[i]; sumSquares += sample * sample; count++; }
  }
  const rms = Math.sqrt(sumSquares / Math.max(1, count));
  const isSilent = rms <= threshold;
  if (isSilent && silenceStart < 0) silenceStart = offset / sampleRate;
  if (!isSilent && silenceStart >= 0) {
   const rangeEnd = offset / sampleRate;
   if (rangeEnd - silenceStart >= minimumDuration) ranges.push({ start: silenceStart, end: rangeEnd, duration: rangeEnd - silenceStart });
   silenceStart = -1;
  }
 }
 if (silenceStart >= 0) {
  const rangeEnd = buffer.duration;
  if (rangeEnd - silenceStart >= minimumDuration) ranges.push({ start: silenceStart, end: rangeEnd, duration: rangeEnd - silenceStart });
 }
 return ranges;
}

export function SmartCutView() {
 const editor = useEditor();
 const { selectedElements } = useElementSelection();
 const selected = editor.timeline.getElementsWithTracks({ elements: selectedElements });
 const item = selected.length === 1 ? selected[0] : null;
 const [thresholdDb, setThresholdDb] = useState(-42);
 const [minimumDuration, setMinimumDuration] = useState(0.4);
 const [analyzedId, setAnalyzedId] = useState<string | null>(null);
 const [ranges, setRanges] = useState<SilenceRange[]>([]);
 const [error, setError] = useState<string | null>(null);
 const buffer = item?.element.type === "audio" ? item.element.buffer : null;
 const clipDuration = item ? mediaTimeToSeconds({ time: item.element.duration }) : 0;
 const totalSilence = useMemo(() => ranges.reduce((sum, range) => sum + range.duration, 0), [ranges]);

 const analyze = () => {
  if (!buffer) return;
  try {
   const found = detectSilence(buffer, thresholdDb, minimumDuration);
   setRanges(found);
   setAnalyzedId(item?.element.id ?? null);
   setError(null);
  } catch {
   setError("Audio analysis failed. Try another decoded audio clip.");
  }
 };

 return (
  <PanelView title="Smart Cut" contentClassName="pb-6">
   <div className="flex flex-col gap-3">
    <section className="rounded-md border p-3">
     <h3 className="text-sm font-semibold">Silence detection</h3>
     <p className="mt-1 text-xs text-muted-foreground">Find quiet sections in a selected audio clip using local waveform analysis. Your audio is analyzed in the browser.</p>
     {!item ? <p className="mt-3 text-xs text-muted-foreground">Select one audio clip on the timeline to begin.</p> : item.element.type !== "audio" ? <p className="mt-3 text-xs text-muted-foreground">Select an audio clip. Video scene detection is not available in this first release.</p> : !buffer ? <p className="mt-3 text-xs text-muted-foreground">This clip has no decoded audio buffer available for analysis.</p> : (
      <>
       <p className="mt-3 truncate text-xs font-medium">{item.element.name}</p>
       <p className="text-xs text-muted-foreground">Clip duration: {clipDuration.toFixed(2)} seconds</p>
       <div className="mt-4">
        <div className="flex items-center justify-between text-xs"><label htmlFor="smart-cut-threshold">Silence threshold</label><span className="font-medium tabular-nums">{thresholdDb} dB</span></div>
        <input id="smart-cut-threshold" className="mt-2 w-full accent-primary" type="range" min="-60" max="-20" step="1" value={thresholdDb} onChange={(event) => setThresholdDb(Number(event.target.value))} />
        <p className="mt-1 text-[11px] text-muted-foreground">More negative values detect quieter sections only.</p>
       </div>
       <div className="mt-4">
        <div className="flex items-center justify-between text-xs"><label htmlFor="smart-cut-minimum">Minimum silence length</label><span className="font-medium tabular-nums">{minimumDuration.toFixed(1)}s</span></div>
        <input id="smart-cut-minimum" className="mt-2 w-full accent-primary" type="range" min="0.2" max="2" step="0.1" value={minimumDuration} onChange={(event) => setMinimumDuration(Number(event.target.value))} />
       </div>
       <Button className="mt-4 w-full" onClick={analyze}>Analyze audio</Button>
      </>
     )}
    </section>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {analyzedId && analyzedId === item?.element.id && (
     <section className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Analysis results</h3><span className="text-xs text-muted-foreground">{ranges.length} quiet sections</span></div>
      <div className="mt-3 grid grid-cols-2 gap-2">
       <div className="rounded bg-muted/50 p-2"><p className="text-[11px] text-muted-foreground">Total silence</p><p className="text-lg font-semibold tabular-nums">{totalSilence.toFixed(1)}s</p></div>
       <div className="rounded bg-muted/50 p-2"><p className="text-[11px] text-muted-foreground">Potential trim</p><p className="text-lg font-semibold tabular-nums">{clipDuration > 0 ? Math.min(100, totalSilence / clipDuration * 100).toFixed(0) : 0}%</p></div>
      </div>
      {ranges.length ? <ol className="mt-3 flex flex-col gap-2">{ranges.map((range, index) => <li key={index} className="flex items-center justify-between rounded border px-2 py-2 text-xs"><span>Quiet section {index + 1}</span><span className="font-mono tabular-nums">{range.start.toFixed(2)}s – {range.end.toFixed(2)}s</span><span className="text-muted-foreground">{range.duration.toFixed(1)}s</span></li>)}</ol> : <p className="mt-3 text-xs text-muted-foreground">No quiet sections matched these settings. Try a higher threshold or shorter minimum length.</p>}
      <p className="mt-3 text-xs text-muted-foreground">These are suggested cut points only. Nothing is deleted or changed on your timeline; review each range before trimming.</p>
     </section>
    )}
   </div>
  </PanelView>
 );
}
