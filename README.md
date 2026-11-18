# XTOP Video Studio

XTOP Video Studio is an independent video-editing project built from the open-source OpenCut Classic codebase.

Our goal is to develop a capable, browser-based video editor for creators, with a professional editing workspace, timeline-based editing, media tools, titles, audio, subtitles, effects and reliable video export.

## Project status

This project is under active transformation. The existing editor foundation is being rebranded and extended; not every planned feature is complete yet.

## Technology

- Next.js and React
- TypeScript
- Bun workspaces and Turborepo
- Rust and WebAssembly video-processing components

## Development

The original project uses Bun. See the application setup instructions and environment example in `apps/web`.

The web app workspace is `apps/web`. Its package scripts include:

- `bun run dev` — start the development server
- `bun run build` — create a production build

The original project setup may require environment variables and supporting services. Do not publish secrets or environment files.

## Upstream attribution

XTOP Video Studio is derived from [OpenCut Classic](https://github.com/OpenCut-app/opencut-classic), an archived open-source project distributed under the MIT License.

The original MIT license and copyright notice are retained in this repository. This project is an independent fork and is not affiliated with or endorsed by the OpenCut maintainers.

## Roadmap

1. Establish XTOP branding and a reliable web deployment.
2. Review and stabilize the existing editing workspace.
3. Improve mobile usability and media import.
4. Expand timeline, text, audio, subtitle and effects workflows.
5. Validate rendering and export quality.
6. Add optional AI-assisted creator tools.

## License

See [LICENSE](LICENSE). Original OpenCut Classic license notices are preserved.
