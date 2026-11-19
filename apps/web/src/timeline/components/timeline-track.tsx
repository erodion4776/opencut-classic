"use client";

import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { TimelineElement } from "./timeline-element";
import type { TimelineTrack } from "@/timeline";
import type { TimelineElement as TimelineElementType } from "@/timeline";
import { TIMELINE_LAYERS } from "./layers";
import type { ElementDragView } from "@/timeline";
import { timelineTimeToPixels } from "@/timeline";
import { useAssetsPanelStore } from "@/components/editor/panels/assets/assets-panel-store";

interface TimelineTrackContentProps {
	track: TimelineTrack;
	isMainTrack: boolean;
	zoomLevel: number;
	dragView: ElementDragView;
	onResizeStart: (params: {
		event: React.MouseEvent;
		element: TimelineElementType;
		track: TimelineTrack;
		side: "left" | "right";
	}) => void;
	onElementMouseDown: (params: {
		event: React.MouseEvent;
		element: TimelineElementType;
		track: TimelineTrack;
	}) => void;
	onElementClick: (params: {
		event: React.MouseEvent;
		element: TimelineElementType;
		track: TimelineTrack;
	}) => void;
	onTrackMouseDown?: (event: React.MouseEvent) => void;
	onTrackMouseUp?: (event: React.MouseEvent) => void;
	shouldIgnoreClick?: () => boolean;
	targetElementId?: string | null;
}

export function TimelineTrackContent({
	track,
	isMainTrack,
	zoomLevel,
	dragView,
	onResizeStart,
	onElementMouseDown,
	onElementClick,
	onTrackMouseDown,
	onTrackMouseUp,
	shouldIgnoreClick,
	targetElementId = null,
}: TimelineTrackContentProps) {
	const { isElementSelected } = useElementSelection();
	const setActiveTab = useAssetsPanelStore((state) => state.setActiveTab);
	const lastElementEnd = track.elements.reduce(
		(end, element) => Math.max(end, element.startTime + element.duration),
		0,
	);
	const appendMediaLeft = timelineTimeToPixels({ time: lastElementEnd, zoomLevel }) + 8;
	const openAssetTab = (tab: "media" | "sounds" | "text") => {
		setActiveTab(tab);
		if (typeof window !== "undefined") {
			window.dispatchEvent(new CustomEvent("xtop:mobile-open-panel", { detail: { panel: "media" } }));
		}
	};

	return (
		<div className="relative size-full">
			<button
				type="button"
				className="absolute inset-0 m-0 size-full appearance-none border-0 bg-transparent p-0"
				aria-label={`Select ${track.name} track`}
				onMouseUp={(event) => {
					if (shouldIgnoreClick?.()) return;
					onTrackMouseUp?.(event);
				}}
				onMouseDown={(event) => {
					event.preventDefault();
					onTrackMouseDown?.(event);
				}}
			/>
			{/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- spatial gesture surface; the wrapping <button> handles keyboard track selection, this <div> only forwards background clicks for box-select / deselect. */}
			<div
				className="relative h-full min-w-full"
				style={{ zIndex: TIMELINE_LAYERS.trackContent }}
				onMouseUp={(event) => {
					if (event.target !== event.currentTarget) return;
					if (shouldIgnoreClick?.()) return;
					onTrackMouseUp?.(event);
				}}
				onMouseDown={(event) => {
					if (event.target !== event.currentTarget) return;
					event.preventDefault();
					onTrackMouseDown?.(event);
				}}
			>
				{track.elements.length === 0 ? (
					<>
						<div className="text-muted-foreground border-muted/30 pointer-events-none flex size-full items-center justify-center rounded-sm border-2 border-dashed text-xs max-md:hidden" />
						<button
							type="button"
							className="absolute inset-0 hidden items-center justify-center gap-2 border-b border-[#252528] text-xs text-muted-foreground transition-colors hover:bg-white/5 max-md:flex"
						onClick={(event) => {
							event.stopPropagation();
							openAssetTab(track.type === "audio" ? "sounds" : track.type === "text" ? "text" : "media");
						}}
					>
						<span className="text-base leading-none">+</span>
						<span>Add {track.type === "audio" ? "audio" : track.type === "text" ? "text" : "media"}</span>
						</button>
					</>
				) : (
					track.elements.map((element) => {
						const isSelected = isElementSelected({
							trackId: track.id,
							elementId: element.id,
						});

						return (
							<TimelineElement
								key={element.id}
								element={element}
								track={track}
								zoomLevel={zoomLevel}
								isSelected={isSelected}
								onResizeStart={({ event, element, side }) =>
									onResizeStart({ event, element, track, side })
								}
								onElementMouseDown={({ event, element }) =>
									onElementMouseDown({ event, element, track })
								}
								onElementClick={({ event, element }) =>
									onElementClick({ event, element, track })
								}
								dragView={dragView}
								isDropTarget={element.id === targetElementId}
							/>
						);
					})
				)}
				{isMainTrack && track.elements.length > 0 && (
					<button
						type="button"
						aria-label="Add media to video track"
						className="absolute top-1/2 z-20 hidden size-8 -translate-y-1/2 max-md:flex items-center justify-center rounded-full border border-white/20 bg-[#252528] text-lg text-white shadow-lg hover:bg-[#343438] max-md:size-7"
						style={{ left: appendMediaLeft }}
						onClick={(event) => {
							event.stopPropagation();
							openAssetTab("media");
						}}
					>
						+
					</button>
				)}
			</div>
		</div>
	);
}
