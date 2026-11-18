"use client";

import { Button } from "../ui/button";
import { ArrowRight, Clapperboard } from "lucide-react";
import { Handlebars } from "./handlebars";
import Link from "next/link";

export function Hero() {
	return (
		<div className="relative flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-between overflow-hidden px-4 text-center">
			<div className="absolute inset-0 -z-50 bg-gradient-to-br from-violet-950/70 via-background to-cyan-950/50" />
			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center">
				<div className="mb-6 inline-flex items-center gap-2 self-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
					<Clapperboard className="h-4 w-4" />
					XTOP Social Studio · Video Editor
				</div>
				<div className="inline-block text-4xl font-bold tracking-tighter md:text-[4rem]">
					<h1>Create videos with</h1>
					<Handlebars>XTOP Studio</Handlebars>
				</div>

				<p className="text-muted-foreground mx-auto mt-8 max-w-xl text-base font-light tracking-wide sm:text-xl">
					Bring your footage together, shape your story, and export videos ready to publish. Your creative workspace is part of XTOP Social Studio.
				</p>

				<div className="mt-8 flex justify-center gap-4">
					<Link href="/projects">
						<Button type="button" size="lg" className="h-11 text-base">
							Start creating
							<ArrowRight className="ml-1" />
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
