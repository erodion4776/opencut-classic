"use client";

import { useParams } from "next/navigation";
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable";
import { AssetsPanel } from "@/components/editor/panels/assets";
import { PropertiesPanel } from "@/components/editor/panels/properties";
import { Timeline } from "@/timeline/components";
import { PreviewPanel } from "@/preview/components";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorProvider } from "@/components/providers/editor-provider";
import { Onboarding } from "@/components/editor/onboarding";
import { MigrationDialog } from "@/project/components/migration-dialog";
import { usePanelStore } from "@/editor/panel-store";
import { usePasteMedia } from "@/media/use-paste-media";
import { MobileGate } from "@/components/editor/mobile-gate";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "@/editor/use-editor";
import { AudioLines, Captions, Scissors, Layers, SlidersHorizontal, Sparkles, Type, X } from "lucide-react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { ChangelogNotification } from "@/changelog/components/changelog-notification";
import {
	createPreviewOverlayControl,
	isPreviewOverlayVisible,
	mergePreviewOverlaySources,
} from "@/preview/overlays";
import { usePreviewStore } from "@/preview/preview-store";
import { getGuidePreviewOverlaySource } from "@/guides";
import {
	bookmarkNotesPreviewOverlay,
	getBookmarkPreviewOverlaySource,
} from "@/timeline/bookmarks/index";

export default function Editor() {
	const params = useParams();
	const projectId = params.project_id as string;

	return (
		<MobileGate>
			<EditorProvider projectId={projectId}>
				<div className="bg-background flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden max-md:overflow-x-hidden max-md:bg-black">
					<DegradedRendererBanner />
					<EditorHeader />
					<div className="min-h-0 min-w-0 flex-1">
						<EditorLayout />
					</div>
					<Onboarding />
					<MigrationDialog />
					<ChangelogNotification />
				</div>
			</EditorProvider>
		</MobileGate>
	);
}

function DegradedRendererBanner() {
	const isDegraded = useEditor((e) => e.renderer.isDegraded);
	const [dismissed, setDismissed] = useState(false);
	if (!isDegraded || dismissed) return null;

	return (
		<div className="bg-accent border-b h-9 flex items-center justify-center gap-2 text-xs text-muted-foreground">
			<span>For the best experience, open XTOP Video Studio in Chrome.</span>
			<Button
				variant="text"
				size="icon"
				className="p-0 w-auto [&_svg]:size-3.5"
				onClick={() => setDismissed(true)}
				aria-label="Dismiss"
			>
				<HugeiconsIcon icon={Cancel01Icon} />
			</Button>
		</div>
	);
}

function EditorLayout() {
	usePasteMedia();
	const { panels, setPanel } = usePanelStore();
	const [isMobile, setIsMobile] = useState(false);
	const [mobilePanel, setMobilePanel] = useState<"media" | "preview" | "properties">("preview");

	useEffect(() => {
		const mediaQuery = window.matchMedia("(max-width: 767px)");
		const updateViewport = () => setIsMobile(mediaQuery.matches);
		updateViewport();
		mediaQuery.addEventListener("change", updateViewport);
		return () => mediaQuery.removeEventListener("change", updateViewport);
	}, []);
	useEffect(() => {
		const openMobilePanel = (event: Event) => {
			const detail = (event as CustomEvent<{ panel?: "media" | "properties" }>).detail;
			setMobilePanel(detail?.panel ?? "media");
		};
		window.addEventListener("xtop:mobile-open-panel", openMobilePanel);
		return () => window.removeEventListener("xtop:mobile-open-panel", openMobilePanel);
	}, []);
	const activeScene = useEditor((editor) =>
		editor.scenes.getActiveSceneOrNull(),
	);
	const currentTime = useEditor((editor) => editor.playback.getCurrentTime());
	const activeGuide = usePreviewStore((state) => state.activeGuide);
	const overlays = usePreviewStore((state) => state.overlays);
	const setOverlayVisibility = usePreviewStore(
		(state) => state.setOverlayVisibility,
	);
	const showBookmarkNotes = isPreviewOverlayVisible({
		overlay: bookmarkNotesPreviewOverlay,
		overlays,
	});

	const overlaySource = useMemo(
		() =>
			mergePreviewOverlaySources({
				sources: [
					getGuidePreviewOverlaySource({
						guideId: activeGuide,
					}),
					activeScene
						? getBookmarkPreviewOverlaySource({
								bookmarks: activeScene.bookmarks,
								time: currentTime,
								isVisible: showBookmarkNotes,
							})
						: {
								definitions: [bookmarkNotesPreviewOverlay],
								instances: [],
							},
				],
			}),
		[activeGuide, activeScene, currentTime, showBookmarkNotes],
	);

	const overlayControls = useMemo(
		() =>
			overlaySource.definitions.map((overlay) =>
				createPreviewOverlayControl({ overlay, overlays }),
			),
		[overlaySource.definitions, overlays],
	);

	if (isMobile) {
		return (
			<div className="relative flex h-full min-h-0 min-w-0 flex-col gap-0 overflow-x-hidden bg-black text-white">
				<div className="min-h-0 flex-[0_0_48%] overflow-hidden bg-black">
					<PreviewPanel overlayControls={overlayControls} overlayInstances={overlaySource.instances} onOverlayVisibilityChange={setOverlayVisibility} />
				</div>
				<div className="min-h-0 flex-1 overflow-hidden border-t border-[#242426] bg-black"><Timeline /></div>
				<MobileActionDock onOpenPanel={setMobilePanel} />
				{mobilePanel !== "preview" && (
					<div className="absolute inset-x-0 bottom-16 z-40 flex max-h-[42%] min-h-0 flex-col overflow-hidden rounded-t-2xl border border-[#29292c] bg-[#111113] shadow-2xl">
						<div className="flex h-12 shrink-0 items-center justify-between border-b border-[#29292c] px-4"><span className="text-sm font-semibold text-white">{mobilePanel === "properties" ? "Properties" : "Media & tools"}</span><button type="button" aria-label="Close panel" className="flex size-10 items-center justify-center rounded-full bg-[#242426]" onClick={() => setMobilePanel("preview")}><X className="size-5" /></button></div>
						<div className="min-h-0 flex-1 overflow-auto">{mobilePanel === "properties" ? <PropertiesPanel /> : <AssetsPanel />}</div>
					</div>
				)}
			</div>
		);
	}
	return (
		<ResizablePanelGroup
			direction="vertical"
			className="size-full gap-[0.18rem]"
			onLayout={(sizes) => {
				setPanel({
					panel: "mainContent",
					size: sizes[0] ?? panels.mainContent,
				});
				setPanel({
					panel: "timeline",
					size: sizes[1] ?? panels.timeline,
				});
			}}
		>
			<ResizablePanel
				defaultSize={panels.mainContent}
				minSize={30}
				maxSize={85}
				className="min-h-0"
			>
				<ResizablePanelGroup
					direction="horizontal"
					className="size-full gap-[0.19rem] px-3"
					onLayout={(sizes) => {
						setPanel({ panel: "tools", size: sizes[0] ?? panels.tools });
						setPanel({ panel: "preview", size: sizes[1] ?? panels.preview });
						setPanel({
							panel: "properties",
							size: sizes[2] ?? panels.properties,
						});
					}}
				>
					<ResizablePanel
						defaultSize={panels.tools}
						minSize={15}
						maxSize={40}
						className="min-w-0"
					>
						<AssetsPanel />
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel
						defaultSize={panels.preview}
						minSize={30}
						className="min-h-0 min-w-0 flex-1"
					>
						<PreviewPanel
							overlayControls={overlayControls}
							overlayInstances={overlaySource.instances}
							onOverlayVisibilityChange={setOverlayVisibility}
						/>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel
						defaultSize={panels.properties}
						minSize={15}
						maxSize={40}
						className="min-w-0"
					>
						<PropertiesPanel />
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>

			<ResizableHandle withHandle />

			<ResizablePanel
				defaultSize={panels.timeline}
				minSize={15}
				maxSize={70}
				className="min-h-0 px-3 pb-3"
			>
				<Timeline />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}


function MobileActionDock({ onOpenPanel }: { onOpenPanel: (panel: "media" | "preview" | "properties") => void }) {
	const items = [
		{ label: "Edit", icon: Scissors, panel: "media" as const },
		{ label: "Audio", icon: AudioLines, panel: "media" as const },
		{ label: "Text", icon: Type, panel: "media" as const },
		{ label: "Effects", icon: Sparkles, panel: "media" as const },
		{ label: "Overlay", icon: Layers, panel: "media" as const },
		{ label: "Captions", icon: Captions, panel: "media" as const },
		{ label: "Properties", icon: SlidersHorizontal, panel: "properties" as const },
	];
	const dockRef = useRef<HTMLElement>(null);
	useEffect(() => {
		if (dockRef.current) dockRef.current.scrollLeft = 0;
	}, []);
	return <nav ref={dockRef} aria-label="Mobile editing tools" className="z-30 flex h-16 w-full shrink-0 items-center gap-1 overflow-x-auto overflow-y-hidden border-t border-[#242426] bg-[#09090a] px-1 pb-[env(safe-area-inset-bottom)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{items.map(({ label, icon: Icon, panel }) => <button key={label} type="button" onClick={() => onOpenPanel(panel)} className="flex h-12 w-[64px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] text-[#b8b8bd] active:bg-[#242426]"><Icon className="size-5" /><span className="whitespace-nowrap">{label}</span></button>)}</nav>;
}