"use client";

import { Button } from "@/components/ui/button";
import { Section, SectionContent, SectionFields } from "@/components/section";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { UpdateElementsCommand } from "@/commands";

const CAPTION_PRESETS = [
	{
		id: "classic",
		name: "Classic",
		description: "Clean white captions with a subtle shadow-free look",
		params: {
			fontFamily: "Arial",
			fontSize: 5,
			color: "#ffffff",
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			"background.enabled": false,
		},
	},
	{
		id: "creator",
		name: "Creator Bold",
		description: "Large, high-contrast captions for short-form video",
		params: {
			fontFamily: "Arial",
			fontSize: 6.5,
			color: "#ffffff",
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			"background.enabled": true,
			"background.color": "#171717",
			"background.cornerRadius": 0.18,
			"background.paddingX": 0.22,
			"background.paddingY": 0.12,
		},
	},
	{
		id: "highlight",
		name: "Yellow Highlight",
		description: "Bright yellow text for energetic emphasis",
		params: {
			fontFamily: "Arial",
			fontSize: 6,
			color: "#ffe34d",
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			"background.enabled": false,
		},
	},
	{
		id: "boxed",
		name: "Soft Box",
		description: "Readable white text inside a rounded dark panel",
		params: {
			fontFamily: "Arial",
			fontSize: 5.5,
			color: "#ffffff",
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			"background.enabled": true,
			"background.color": "#202020",
			"background.cornerRadius": 0.28,
			"background.paddingX": 0.3,
			"background.paddingY": 0.18,
		},
	},
] as const;

export function CaptionStylesView() {
	const editor = useEditor();
	const { selectedElements } = useElementSelection();
	const selectedWithTracks = editor.timeline.getElementsWithTracks({
		elements: selectedElements,
	});
	const selectedText = selectedWithTracks.filter(
		({ element }) => element.type === "text",
	);
	const unsupportedCount = selectedWithTracks.length - selectedText.length;

	const applyPreset = (presetId: string) => {
		const preset = CAPTION_PRESETS.find((item) => item.id === presetId);
		if (!preset || selectedText.length === 0) return;

		editor.command.execute({
			command: new UpdateElementsCommand({
				updates: selectedText.map(({ element, track }) => ({
					trackId: track.id,
					elementId: element.id,
					patch: {
						params: {
							...element.params,
							...preset.params,
						},
					},
				})),
			}),
		});
	};

	return (
		<Section sectionKey="xtop-caption-styles">
			<SectionContent className="pt-3">
				<div className="mb-3 space-y-1">
					<h3 className="text-sm font-semibold">Caption style studio</h3>
					<p className="text-muted-foreground text-xs">
						Select one or more text or subtitle clips on the timeline, then apply a style.
					</p>
				</div>
				<SectionFields>
					{CAPTION_PRESETS.map((preset) => (
						<div
							key={preset.id}
							className="flex items-center justify-between gap-3 rounded-md border p-3"
						>
							<div className="min-w-0">
								<p className="text-sm font-medium">{preset.name}</p>
								<p className="text-muted-foreground text-xs">{preset.description}</p>
							</div>
							<Button
								type="button"
								size="sm"
								variant="outline"
								disabled={selectedText.length === 0}
								onClick={() => applyPreset(preset.id)}
							>
								Apply
							</Button>
						</div>
					))}
				</SectionFields>
				<div className="mt-3 space-y-1">
					<p className="text-xs text-muted-foreground">
						{selectedText.length} text clip(s) selected
					</p>
					{unsupportedCount > 0 && (
						<p className="text-xs text-amber-600">
							{unsupportedCount} non-text selection(s) will be left unchanged.
						</p>
					)}
					{selectedText.length === 0 && (
						<p className="text-xs text-muted-foreground">
							No text clips selected. Add captions or text, then select them on the timeline.
						</p>
					)}
				</div>
			</SectionContent>
		</Section>
	);
}
