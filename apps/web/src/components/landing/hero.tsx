"use client";

import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { Handlebars } from "./handlebars";
import Link from "next/link";

export function Hero() {
	return (
		<div className="flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-between px-4 text-center">
			<div className="absolute inset-0 -z-50 bg-gradient-to-br from-violet-950/70 via-background to-cyan-950/50" />
			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center">
				<div className="inline-block text-4xl font-bold tracking-tighter md:text-[4rem]">
					<h1>Create videos with</h1>
					<Handlebars>XTOP Studio</Handlebars>
				</div>

				<p className="text-muted-foreground mx-auto mt-10 max-w-xl text-base font-light tracking-wide sm:text-xl">
					A creative video workspace for editing, storytelling and sharing. Build your next video with XTOP.
				</p>

				<div className="mt-8 flex justify-center gap-8">
					<Link href="/projects">
						<Button type="submit" size="lg" className="h-11 text-base">
							Open Studio
							<ArrowRight className="ml-0.5" />
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
