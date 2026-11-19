"use client";

import { useState, useEffect } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { useEditor } from "@/editor/use-editor";
import { formatTimecode } from "opencut-wasm";
import { invokeAction } from "@/actions";
import { EditableTimecode } from "@/components/editable-timecode";
import { Button } from "@/components/ui/button";
import {
	FullScreenIcon,
	PauseIcon,
	PlayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectSeparator,
} from "@/components/ui/select";
import { PREVIEW_ZOOM_PRESETS } from "@/preview/zoom";
import { usePreviewViewport } from "./preview-viewport";
import { GridPopover } from "./guide-popover";
import { usePreviewStore } from "@/preview/preview-store";
import type { MediaTime } from "@/wasm";

export function PreviewToolbar({
	onToggleFullscreen,
}: {
	onToggleFullscreen: () => void;
}) {
	return (
		<>
			<div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-1 px-5 pb-3 pt-5 md:grid">
				<div className="flex min-w-0 items-center gap-1"><TimecodeDisplay /></div>
				<PlayPauseButton />
				<div className="flex items-center justify-self-end gap-1">
					<ZoomSelect />
					<Separator orientation="vertical" className="h-4" />
					<Button variant="text" onClick={onToggleFullscreen}>
						<HugeiconsIcon icon={FullScreenIcon} />
					</Button>
				</div>
			</div>
			<div className="grid grid-cols-[1fr_auto_1fr] grid-rows-[40px_24px] items-center gap-x-1 bg-black px-2 py-1 md:hidden">
				<Button variant="text" size="icon" aria-label="Fullscreen" className="col-start-1 row-start-1 size-10 justify-self-start" onClick={onToggleFullscreen}>
					<HugeiconsIcon icon={FullScreenIcon} />
				</Button>
				<div className="col-start-2 row-start-1 justify-self-center"><PlayPauseButton /></div>
				<div className="col-start-3 row-start-1 flex items-center justify-self-end">
					<Button variant="text" size="icon" aria-label="Undo" className="size-10" onClick={() => invokeAction("undo")}><Undo2 className="size-5" /></Button>
					<Button variant="text" size="icon" aria-label="Redo" className="size-10" onClick={() => invokeAction("redo")}><Redo2 className="size-5" /></Button>
				</div>
				<div className="col-span-3 row-start-2 min-w-0 justify-self-start"><TimecodeDisplay /></div>
			</div>
		</>
	);
}

function TimecodeDisplay() {
	const editor = useEditor();
	const totalDuration = useEditor((e) => e.timeline.getTotalDuration());
	const fps = useEditor((e) => e.project.getActive().settings.fps);
	const [currentTime, setCurrentTime] = useState<MediaTime>(() =>
		editor.playback.getCurrentTime(),
	);

	useEffect(() => {
		const unsubscribeUpdate = editor.playback.onUpdate(setCurrentTime);
		const unsubscribeSeek = editor.playback.onSeek(setCurrentTime);
		return () => {
			unsubscribeUpdate();
			unsubscribeSeek();
		};
	}, [editor.playback]);

	return (
		<div className="flex min-w-0 items-center">
			<EditableTimecode
				time={currentTime}
				duration={totalDuration}
				format="HH:MM:SS:FF"
				fps={fps}
				onTimeChange={({ time }) => editor.playback.seek({ time })}
				className="text-center"
			/>
			<span className="text-muted-foreground px-2 font-mono text-xs">/</span>
			<span className="text-muted-foreground font-mono text-xs">
				{formatTimecode({
					time: totalDuration,
					format: "HH:MM:SS:FF",
					rate: fps,
				})}
			</span>
		</div>
	);
}

function ZoomSelect() {
	const { isAtFit, zoomPercent, fitToScreen, setViewportPercent } =
		usePreviewViewport();

	const displayLabel = isAtFit ? "Fit" : `${zoomPercent}%`;

	const onValueChange = (value: string) => {
		if (value === "fit") {
			fitToScreen();
		} else {
			setViewportPercent({ percent: Number(value) });
		}
	};

	return (
		<Select
			value={isAtFit ? "fit" : String(zoomPercent)}
			onValueChange={onValueChange}
		>
			<SelectTrigger className="tabular-nums">{displayLabel}</SelectTrigger>
			<SelectContent>
				<SelectItem value="fit">Fit</SelectItem>
				<SelectSeparator />
				{PREVIEW_ZOOM_PRESETS.map((preset) => (
					<SelectItem key={preset} value={String(preset)}>
						{preset}%
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function PlayPauseButton() {
	const isPlaying = useEditor((e) => e.playback.getIsPlaying());

	return (
		<Button
			variant="text"
			size="icon"
			onClick={() => invokeAction("toggle-play")}
		>
			<HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} />
		</Button>
	);
}
