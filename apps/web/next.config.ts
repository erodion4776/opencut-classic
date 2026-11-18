import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	reactStrictMode: true,
	productionBrowserSourceMaps: true,
	output: "standalone",
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "plus.unsplash.com" },
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "images.marblecms.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
			{ protocol: "https", hostname: "api.iconify.design" },
			{ protocol: "https", hostname: "api.simplesvg.com" },
			{ protocol: "https", hostname: "api.unisvg.com" },
			{ protocol: "https", hostname: "cdn.brandfetch.io" },
		],
	},
};

// The monorepo installs botid against the root Next.js copy while this app
// resolves its own Next.js copy. Keep the config typed to the app's Next.js,
// then bridge the wrapper's duplicate type identity at this integration edge.
const botProtectedConfig = withBotId(
	nextConfig as unknown as Parameters<typeof withBotId>[0],
);

export default withContentCollections(botProtectedConfig as unknown as NextConfig);
