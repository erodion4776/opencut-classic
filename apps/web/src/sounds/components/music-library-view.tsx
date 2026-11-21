"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSoundSearch } from "@/sounds/use-sound-search";
import { useSoundsStore } from "@/sounds/sounds-store";
import type { SoundEffect } from "@/sounds/types";
import { FavouriteIcon, PauseIcon, PlayIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function MusicLibraryView() {
 const [query, setQuery] = useState("music");
 const [playingId, setPlayingId] = useState<number | null>(null);
 const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
 const { results, isLoading, loadMore, hasNextPage, isLoadingMore, error } = useSoundSearch({
  query,
  commercialOnly: true,
  type: "songs",
 });
 const { addSoundToTimeline, isSoundSaved, toggleSavedSound } = useSoundsStore();

 useEffect(() => () => { audio?.pause(); }, [audio]);

 const play = (sound: SoundEffect) => {
  if (playingId === sound.id) {
   audio?.pause();
   setPlayingId(null);
   return;
  }
  audio?.pause();
  if (!sound.previewUrl) return;
  const next = new Audio(sound.previewUrl);
  next.addEventListener("ended", () => setPlayingId(null), { once: true });
  next.addEventListener("error", () => setPlayingId(null), { once: true });
  next.play().then(() => {
   setAudio(next);
   setPlayingId(sound.id);
  }).catch(() => setPlayingId(null));
 };

 return (
  <div className="mt-1 flex h-full min-h-0 flex-col gap-4">
   <div className="flex flex-col gap-2">
    <Input
     placeholder="Search music, beats or background tracks"
     value={query === "music" ? "" : query}
     onChange={({ currentTarget }) => setQuery(currentTarget.value || "music")}
     showClearIcon
     onClear={() => setQuery("music")}
    />
    <p className="text-xs text-muted-foreground">Music search · commercially licensed results only. Check each track's licence before publishing.</p>
   </div>
   {error && <p className="text-sm text-destructive">{error}</p>}
   <ScrollArea className="min-h-0 flex-1">
    <div className="flex flex-col gap-4 pr-2">
     {isLoading && <p className="text-sm text-muted-foreground">Searching music...</p>}
     {!isLoading && results.length === 0 && !error && <p className="text-sm text-muted-foreground">No music found. Try another search.</p>}
     {results.map((sound) => {
      const saved = isSoundSaved({ soundId: sound.id });
      return (
       <div key={sound.id} className="flex items-center gap-2">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => play(sound)}>
         <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent">
          <HugeiconsIcon icon={playingId === sound.id ? PauseIcon : PlayIcon} className="size-5" />
         </span>
         <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{sound.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{sound.username} · {Math.floor(sound.duration / 60)}:{String(Math.floor(sound.duration % 60)).padStart(2, "0")}</span>
          <span className="block truncate text-xs text-muted-foreground">{sound.license}</span>
         </span>
        </button>
        <Button variant="text" size="icon" title="Add music to timeline" onClick={() => addSoundToTimeline({ sound })}>
         <HugeiconsIcon icon={PlusSignIcon} />
        </Button>
        <Button variant="text" size="icon" title={saved ? "Remove saved music" : "Save music"} onClick={() => toggleSavedSound({ soundEffect: sound })}>
         <HugeiconsIcon icon={FavouriteIcon} className={saved ? "fill-current text-red-500" : ""} />
        </Button>
       </div>
      );
     })}
     {hasNextPage && <Button variant="outline" disabled={isLoadingMore} onClick={loadMore}>{isLoadingMore ? "Loading..." : "Load more music"}</Button>}
    </div>
   </ScrollArea>
  </div>
 );
}
