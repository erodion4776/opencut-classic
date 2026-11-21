"use client";

import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { getPropertiesConfig } from "@/components/editor/panels/properties/registry";
import { PanelView } from "./base-panel";

export function TextStudioView() {
	const editor = useEditor();
	const mediaAssets = useEditor((state) => state.media.getAssets());
	const { selectedElements } = useElementSelection();
	const selected = editor.timeline.getElementsWithTracks({ elements: selectedElements });
	const item = selected.length === 1 ? selected[0] : null;
	const isText = item?.element.type === "text";

	if (selectedElements.length !== 1 || !item || !isText) {
		return (
			<PanelView title="Text Studio">
				<div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center">
					<p className="text-sm font-medium">
						{selectedElements.length === 0 ? "Select a text clip" : "Select one text clip at a time"}
					</p>
					<p className="max-w-60 text-xs text-muted-foreground">
						Edit typography, caption backgrounds, alignment, spacing and placement from one panel.
					</p>
				</div>
			</PanelView>
		);
	}

	const config = getPropertiesConfig({ element: item.element, mediaAssets });
	const textTab = config.tabs.find((tab) => tab.id === "text");
	const transformTab = config.tabs.find((tab) => tab.id === "transform");

	return (
		<PanelView title="Text Studio" contentClassName="pb-6">
			<div className="flex flex-col gap-3">
				<div className="rounded-md border p-3">
					<p className="text-sm font-medium">Selected text layer</p>
					<p className="mt-1 truncate text-xs text-muted-foreground">{item.element.name}</p>
				</div>
				{ textTab && (
					<section className="rounded-md border p-2">
						<h3 className="px-2 pt-1 text-xs font-semibold text-muted-foreground">TYPOGRAPHY & BACKGROUND</h3>
						{textTab.content({ trackId: item.track.id })}
					</section>
				)}
				{ transformTab && (
					<section className="rounded-md border p-2">
						<h3 className="px-2 pt-1 text-xs font-semibold text-muted-foreground">POSITION & SIZE</h3>
						{transformTab.content({ trackId: item.track.id })}
					</section>
				)}
				<p className="text-xs text-muted-foreground">
					Changes use the editor's existing parameter system and are saved with the project. Controls are limited to properties supported by the current text renderer.
				</p>
			</div>
		</PanelView>
	);
}
