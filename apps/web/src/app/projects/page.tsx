"use client";

import dynamic from "next/dynamic";

const ProjectsPage = dynamic(() => import("./projects-client"), {
	ssr: false,
});

export default function Page() {
	return <ProjectsPage />;
}
