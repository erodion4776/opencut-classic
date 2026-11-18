"use client";

import { useLocalStorage } from "@/services/storage/use-local-storage";
import { Button } from "../ui/button";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "../ui/dialog";

export function Onboarding() {
	const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage({
		key: "hasSeenOnboarding",
		defaultValue: false,
	});

	const handleClose = () => {
		setHasSeenOnboarding({ value: true });
	};

	return (
		<Dialog open={!hasSeenOnboarding} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogTitle>
					<span className="sr-only">Welcome to XTOP Video Studio</span>
				</DialogTitle>
				<DialogBody>
					<div className="space-y-5">
						<div className="space-y-3">
							<h2 className="text-lg font-bold md:text-xl">
								Welcome to XTOP Video Studio 🎬
							</h2>
							<p className="text-muted-foreground">
								Create and edit videos with your own creative tools. Import
								videos, images, and audio to your timeline, arrange your clips,
								and start creating.
							</p>
						</div>
						<Button onClick={handleClose} variant="default" className="w-full">
							Get Started
						</Button>
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
