# XTOP Social Studio — Editor Feature Status

This document records capabilities present in the `xtop-social-studio-editor` branch. It distinguishes connected controls from unfinished work; it is not a claim that the app has passed a production build or device QA.

## Existing editor foundation

The current editor route is `apps/web/src/app/editor/[project_id]/page.tsx`.

- Project-based editor shell with an editor provider.
- Resizable desktop workspace with media/tools, preview, properties, and timeline areas.
- Compact mobile workspace with Media & tools, Preview, and Properties tabs, plus a persistent timeline area.
- Media, sounds, text, stickers, effects, captions, settings, and a selected-clip adjustment panel.
- The Adjustment panel is connected to the existing property registry. For a single selected visual clip it exposes the available transform controls (position, scale, rotation), blending controls (opacity and blend mode), and clip-effects editor. It does not create a parallel editing model.
- The current default effect registry contains one effect: Gaussian Blur, with an intensity parameter. Do not describe this as a large CapCut-style effects library.
- Audio clips use their existing Audio and Speed property controls in the Properties panel; they do not currently expose the visual Adjustment panel's transform/blending/effects groups.
- The existing caption panel is wired to the subtitles module (`@/subtitles/components/assets-view`).
- The existing export dialog supports the formats and quality controls implemented by the upstream export engine.
- Project rename, exit, delete, onboarding, and migration flows remain part of the editor.

## Confirmed unfinished areas

- **Transitions:** the asset-panel tab still displays “Transitions view coming soon...”. No XTOP transitions browser or verified transition workflow has been added.
- **Color grading:** brightness, contrast, saturation, temperature, tint, and similar grading controls are not implemented as persisted renderer-backed controls.
- **Effects library:** only the registered upstream Gaussian Blur effect is currently confirmed in the default effect definitions. Additional effects require real shader/renderer support and persisted parameters.
- **Social publishing handoff:** export currently provides the starting point for a manual handoff; direct upload into the XTOP publisher has not been implemented or verified.

## XTOP build sequence

### Stage 1 — Editing workflow reliability
- Verify importing video, audio, and image assets on Android Chrome and desktop browsers.
- Verify adding text and captions to the timeline, selecting them, editing their properties, and saving/reopening the project.
- Verify trimming, splitting, moving, and deleting timeline clips.
- Verify visual clip transform, blending, and blur effect controls persist and render correctly.
- Verify export completion, downloaded file integrity, and error handling.

### Stage 2 — Creator controls
- Implement a transitions browser only after the timeline model, editing operations, serialization, and renderer support a real transition representation.
- Implement color grading only when color parameters are persisted in the project model and consumed by the render/export pipeline.
- Expand effects only with actual renderer-backed effects and editable parameters.
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
- [ ] Verify transform, blending, and Gaussian Blur edits persist and affect preview/export.
- [ ] Export MP4 and verify the resulting file plays.
- [ ] Export failures are surfaced clearly and do not report false success.
- [ ] Publisher upload and composer selection are verified end-to-end.
- [ ] No unfinished placeholder is labelled as a completed feature.

## Development rule

Preserve the upstream editing engine and project format. Implement controls through the editor's existing domain APIs and state stores rather than creating a parallel, disconnected editing model. Keep this work on the XTOP branch until the build and acceptance checks pass.
