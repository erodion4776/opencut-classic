# XTOP Social Studio — Editor Feature Status

This document records the editor capabilities present in the `xtop-social-studio-editor` branch and separates connected controls from unfinished work. It is a development checklist, not a claim that every feature has been tested in production.

## Existing editor foundation

The current editor route is `apps/web/src/app/editor/[project_id]/page.tsx`.

- Project-based editor shell with an editor provider.
- Resizable desktop workspace with media/tools, preview, properties, and timeline areas.
- Compact mobile workspace with Media & tools, Preview, and Properties tabs, plus a persistent timeline area.
- Media, sounds, text, stickers, effects, captions, settings, and a selected-clip adjustment panel.
- The adjustment panel reuses the existing clip property controls for transform (position, scale, rotation), blending (opacity and blend mode), and the existing clip-effects editor. It requires a single selected timeline clip. Effects currently available are those registered by the upstream effects engine; brightness, contrast, and saturation grading are not yet implemented.
- Existing caption panel is wired to the subtitles module (`@/subtitles/components/assets-view`).
- Existing export dialog supports the formats and quality controls implemented by the upstream export engine.
- Project rename, exit, delete, onboarding, and migration flows remain part of the editor.

## Confirmed unfinished areas

The asset-panel switch currently renders placeholder copy for:

- **Transitions:** “Transitions view coming soon...”
- **Adjustment:** “Adjustment view coming soon...”

Do not present either as implemented until the corresponding editing controls are connected to the project/timeline model and verified.

## XTOP build sequence

### Stage 1 — Editing workflow reliability
- Verify importing video, audio, and image assets on Android Chrome and desktop browsers.
- Verify adding text and captions to the timeline, selecting them, editing their properties, and saving/reopening the project.
- Verify trimming, splitting, moving, and deleting timeline clips.
- Verify export completion, downloaded file integrity, and error handling.

### Stage 2 — Creator controls
- Implement a transitions browser backed by real timeline transition operations and renderer support.
- Extend adjustment controls only when the rendering and timeline model expose real persisted color parameters (brightness, contrast, saturation, etc.).
- Add subtitle styling and timing controls only where the subtitle engine supports them.
- Keep every control connected to project state; avoid decorative controls that do not change the output.

### Stage 3 — Social publishing handoff
- Export a finished MP4 from the editor.
- Upload the exported file into the XTOP publisher's media library.
- Select the uploaded asset in the publisher composer.
- Later replace the manual handoff with a secure, short-lived, server-validated upload grant. Never share session cookies or platform credentials between the editor and publisher.

## Acceptance checklist

- [ ] Android Chrome: create/open a project and import local media.
- [ ] Android Chrome: edit text/captions and use the timeline without horizontal page overflow.
- [ ] Desktop: resize panels and use the timeline.
- [ ] Save, close, and reopen a project without losing edits.
- [ ] Export MP4 and verify the resulting file plays.
- [ ] Export failures are surfaced clearly and do not report false success.
- [ ] Publisher upload and composer selection are verified end-to-end.
- [ ] No unfinished placeholder is labelled as a completed feature.

## Development rule

Preserve the upstream editing engine and project format. Implement controls through the editor's existing domain APIs and state stores rather than creating a parallel, disconnected editing model. Keep this work on the XTOP branch until the build and acceptance checks pass.
