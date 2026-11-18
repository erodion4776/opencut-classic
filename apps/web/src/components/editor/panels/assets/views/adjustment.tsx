"use client";

import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { getPropertiesConfig } from "@/components/editor/panels/properties/registry";
import { PanelView } from "./base-panel";

const ADJUSTMENT_TABS = new Set(["transform", "blending"]);

export function AdjustmentView() {
	const editor = useEditor();
	useEditor((state) => state.scenes.getActiveSceneOrNull());
	useEditor((state) => state.media.getAssets());
	const { selectedElements } = useElementSelection();

	if (selectedElements.length === 0) {
		return (
			<PanelView title="Adjustments">
				<div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center">
					<p className="text-sm font-medium">Select a clip to adjust it</p>
					<p className="max-w-56 text-xs text-muted-foreground">
						Choose a video, image, text, sticker, or graphic on the timeline.
						Your changes are applied to the selected clip.
					</p>
				</div>
			</PanelView>
		);
	}

	if (selectedElements.length > 1) {
		return (
			<PanelView title="Adjustments">
				<p className="px-2 py-6 text-center text-sm text-muted-foreground">
					Select one clip at a time to edit its adjustments.
				</p>
			</PanelView>
		);
	}

	const item = editor.timeline.getElementsWithTracks({
		elements: selectedElements,
	})[0];

	if (!item) {
		return (
			<PanelView title="Adjustments">
				<p className="px-2 py-6 text-center text-sm text-muted-foreground">
					This clip is not available on the active timeline.
				</p>
			</PanelView>
		);
	}

	const config = getPropertiesConfig({
		element: item.element,
		mediaAssets: editor.media.getAssets(),
	});
	const adjustmentTabs = config.tabs.filter((tab) =>
		ADJUSTMENT_TABS.has(tab.id),
	);

	if (adjustmentTabs.length === 0) {
		return (
			<PanelView title="Adjustments">
				<p className="px-2 py-6 text-center text-sm text-muted-foreground">
					Adjustment controls are not available for this item.
				</p>
			</PanelView>
		);
	}

	return (
		<PanelView title="Adjustments" contentClassName="pb-6">
			<div className="flex flex-col gap-4">
				<p className="px-2 text-xs text-muted-foreground">
					Editing the selected {item.element.type} clip.
				</p>
				{adjustmentTabs.map((tab) => (
					<div key={tab.id} className="rounded-md border p-2">
						<div className="mb-2 text-xs font-medium text-muted-foreground">
							{tab.label}
						</div>
						{tab.content({ trackId: item.track.id })}
					</div>
				))}
			</div>
		</PanelView>
	);
}
