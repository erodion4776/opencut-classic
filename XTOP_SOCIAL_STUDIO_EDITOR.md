# XTOP Social Studio — Video Editor

This repository is the video-editing application for XTOP Social Studio. It is kept as a separate application from the Postiz-based publishing service.

## Product role

Creators use this app to import media, edit a timeline, and export a finished video. The exported MP4 is then added to the XTOP Social Studio media library and selected in the publishing composer.

## Current foundation

- OpenCut editor codebase and its existing project/editor workflow.
- XTOP Social Studio editor branding is configured in `apps/web/src/site/brand.ts`.
- Existing editor route is project-based: `/editor/[project_id]`.
- Existing Next.js, Bun/Turborepo and Rust/WASM architecture is retained.

## Integration phases

### Phase 1 — reliable export/import (MVP)

1. Open the editor from the publishing app in a separate browser tab.
2. Create or open an editing project.
3. Export a standard MP4 from the editor.
4. Return to the publishing app and upload the MP4 to its media library.
5. Select the uploaded asset in the post composer.

The MP4 file is the compatibility boundary. Do not assume the publishing app can read the editor's native project format.

### Phase 2 — secure handoff

Implement only after both applications are deployed over HTTPS:

- The publishing backend issues a short-lived, single-use launch grant.
- The editor backend validates the grant server-side and binds it to the authenticated owner/tenant.
- Upload permissions are scoped to one export and expire quickly.
- Validate MIME type, file size, duration, dimensions and ownership on the server.
- Record audit events and enforce rate limits.
- Never share session cookies, database service-role keys, or social-platform credentials between apps.

### Phase 3 — creator workflow

- Add a Video Editor entry in the publishing navigation.
- Provide a secure return-to-publisher action after export.
- Optionally pass an opaque media handoff identifier; never trust a client-supplied tenant ID.
- Keep publishing permissions and platform API restrictions in the publishing service.

## Export metadata

Where available, preserve:

- `filename`
- `mimeType`
- `sizeBytes`
- `durationMs`
- `width`
- `height`
- `source: "xtop-social-studio-editor"`
- Optional opaque editor project identifier

## Acceptance checks before release

- Test import, edit, preview and MP4 export on Android Chrome and desktop browsers.
- Confirm exported MP4 plays correctly and uploads to the publishing media library.
- Confirm the uploaded asset can be selected in a post.
- Test large files, interrupted exports and failed uploads.
- Verify tenant isolation, expiring grants and server-side file validation before enabling direct handoff.

## Important status

This branch contains branding and integration documentation only at this stage. It is not a claim that the editor has been built, tested, deployed, or connected to the publishing backend. Preserve upstream OpenCut MIT license notices when distributing the application.
