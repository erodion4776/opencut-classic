"use client";

import Image from "next/image";
import { BasePage } from "@/app/base-page";
import { Button } from "@/components/ui/button";

const LOGO = "/logos/xtop-video-studio.svg";

export default function BrandPage() {
	return (
		<BasePage
			maxWidth="6xl"
			title="XTOP Video Studio brand"
			description="The official visual identity for XTOP Video Studio."
		>
			<div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border p-8 text-center">
				<div className="flex size-40 items-center justify-center rounded-3xl bg-neutral-950 p-6">
					<Image src={LOGO} alt="XTOP Video Studio logo" width={128} height={128} />
				</div>
				<h2 className="text-xl font-semibold">XTOP Video Studio</h2>
				<p className="text-muted-foreground text-sm">
					Use this mark when referring to the XTOP Video Studio product.
				</p>
				<Button
					variant="outline"
					onClick={() => {
						const link = document.createElement("a");
						link.href = LOGO;
						link.download = "xtop-video-studio.svg";
						link.click();
					}}
				>
					Download XTOP logo
				</Button>
			</div>
			<p className="text-muted-foreground mx-auto max-w-2xl text-center text-sm leading-relaxed">
				XTOP Video Studio is an independent project derived from OpenCut Classic.
				The original OpenCut Classic source code and MIT license notices are
				retained. XTOP Video Studio is not affiliated with or endorsed by the
				OpenCut maintainers.
			</p>
		</BasePage>
	);
}
