# XTOP Social Studio — Editor Feature Status

This document records capabilities present in the `xtop-social-studio-editor` branch. It distinguishes connected controls from unfinished work; it is not a claim that the app has passed a production build or device QA.

## Existing editor foundation

The current editor route is `apps/web/src/app/editor/[project_id]/page.tsx`.

- Project-based editor shell with an editor provider.
- Resizable desktop workspace with media/tools, preview, properties, and timeline areas.
- Compact mobile workspace with Media & tools, Preview, and Properties tabs, plus a persistent timeline area.
- Media, sounds, text, stickers, effects, captions, settings, and a selected-clip adjustment panel.
- The Adjustment panel is connected to the existing property registry. For a single selected visual clip it exposes the available transform controls (position, scale, rotation), blending controls (opacity and blend mode), and clip-effects editor. It does not create a parallel editing model.
- The default effect registry includes Gaussian Blur, XTOP Color Adjust, Sepia, Black & White, and Vignette. These effects expose persisted parameters through the existing clip-effects controls and use WGSL shaders registered in the Rust GPU effects pipeline. This is a small starter library, not a large CapCut-style effects collection.
- Audio clips use their existing Audio and Speed property controls in the Properties panel; they do not currently expose the visual Adjustment panel's transform/blending/effects groups.
- The existing caption panel is wired to the subtitles module (`@/subtitles/components/assets-view`).
- The existing export dialog supports the formats and quality controls implemented by the upstream export engine.
- Project rename, exit, delete, onboarding, and migration flows remain part of the editor.

## Confirmed unfinished areas

- **Transitions:** the Transitions panel applies Fade In, Fade Out, and Fade In + Out presets to one selected visual clip using native persisted opacity keyframes. It protects clips that already have opacity keyframes. This first step does not implement overlapping-clip crossfades, transition handles, or a general transition model.
- **Text motion:** the Text Motion panel adds Fade Up, Pop In, Slide From Left, and Slide From Right presets to one selected text clip. Presets write native opacity and transform keyframes, preserve existing base values, and refuse to overwrite any affected animation channel. These are linear entrance animations; animated exits, per-word/typewriter reveals, and custom easing presets are not included yet.
- **Color grading:** the first renderer-backed Color Adjust effect now supports brightness, contrast, saturation, and temperature. Tint, curves, HSL controls, LUTs, scopes, and advanced grading remain unimplemented.
- **Effects library:** the starter library now includes Gaussian Blur, Color Adjust, Sepia, Black & White, and Vignette. These additions have source-level renderer wiring but still require compilation and preview/export verification.
- **Text Studio:** a dedicated asset-panel tab exposes the existing text and transform parameter controls for one selected text clip. This includes text content, font family, font size, text color, alignment, weight, style, decoration, letter spacing, line height, background enable/color/rounding/padding/offset, outline color/width, shadow enable/color/blur/offset, and transform position/scale/rotation. Outline strokes are drawn before text fill; shadow is applied to glyph fills. These properties are stored in the text element params and rendered by the canvas text renderer.
- **Caption styling:** the Captions panel includes Classic, Creator Bold, Yellow Highlight, and Soft Box presets. Applying a preset updates selected text/subtitle clips through the existing timeline update command; multi-selection is supported and non-text selections are left unchanged. These are whole-clip styles.
- **Caption entrance and exit animations:** the Captions panel includes Fade In + Out, Pop In + Out, and Slide Up + Down presets for one selected text clip. Duration choices are 0.25, 0.5, 0.75, and 1 second, capped at half the clip duration. Presets use native opacity or transform keyframes and refuse to overwrite an existing affected animation channel. These are linear animations; custom easing, independent entrance/exit timing, and animated caption-word transitions are not included.
- **Word-by-word caption mode:** transcription can now generate one-word, three-word, or five-word caption clips. One-word mode gives a sequential, karaoke-like presentation and can be combined with the caption style presets. The transcription worker requests Whisper word-level timestamps and passes the returned word timings into caption generation. One-word, three-word, and five-word captions are grouped using those model-provided word boundaries when available; if the model returns no usable word timestamps, generation falls back to estimated segment timing. In one-word mode, each sequential word clip receives a bold yellow style, producing a karaoke-style active-word highlight as playback advances. This is implemented as timed individual clips, not animated per-word styling inside one multiword text object. Whisper timestamps are model estimates and should be reviewed for accuracy. Imported SRT/ASS files retain their own cue timing.
- **Social publishing handoff:** export currently provides the starting point for a manual handoff; direct upload into the XTOP publisher has not been implemented or verified.

## XTOP build sequence

### Stage 1 — Editing workflow reliability
- Verify importing video, audio, and image assets on Android Chrome and desktop browsers.
- Verify adding text and captions to the timeline, selecting them, editing their properties, and saving/reopening the project.
- Verify trimming, splitting, moving, and deleting timeline clips.
- Verify visual clip transform, blending, Gaussian Blur, Color Adjust, and Fade In/Out keyframes persist and render correctly.
- Verify Text Studio font, color, background, spacing, alignment, transform, outline and shadow edits persist and render in preview/export.
- Verify outline thickness/color and shadow blur/offset/color at multiple canvas resolutions and with multi-line text.
- Verify export completion, downloaded file integrity, and error handling.

### Stage 2 — Creator controls
- Extend transitions with overlap-aware crossfades and timeline transition handles only after adding a dedicated transition model, editing operations, serialization, and renderer support.
- Extend color grading only with persisted parameters consumed by both preview and export; do not add decorative controls.
- Expand effects only with actual renderer-backed effects and editable parameters.
- Expand subtitle styling with per-word highlighting and timing controls only after word-level timing and renderer support are implemented. Extend caption animation controls with independent entrance/exit timing and easing only after preview/export behaviour is verified.
- Keep every control connected to project state; avoid decorative controls that do not change the output.

### Stage 3 — Social publishing handoff
- Export a finished MP4 from the editor.
- Upload the exported file into the XTOP publisher's media library.
- Select the uploaded asset in the publisher composer.
- Later replace the manual handoff with a secure, short-lived, server-validated upload grant. Never share session cookies or platform credentials between the editor and publisher.

## Acceptance checklist

- [ ] Android Chrome: create/open a project and import local media.
- [ ] Android Chrome: edit text in Text Studio, apply caption style and entrance/exit animation presets, test one-word/three-word/five-word transcription modes, and use the timeline without horizontal page overflow.
- [ ] Desktop: resize panels and use the timeline.
- [ ] Save, close, and reopen a project without losing edits.
- [ ] Verify transform, blending, and Gaussian Blur edits persist and affect preview/export.
- [ ] Export MP4 and verify the resulting file plays.
- [ ] Export failures are surfaced clearly and do not report false success.
- [ ] Publisher upload and composer selection are verified end-to-end.
- [ ] No unfinished placeholder is labelled as a completed feature.

## Development rule

Preserve the upstream editing engine and project format. Implement controls through the editor's existing domain APIs and state stores rather than creating a parallel, disconnected editing model. Keep this work on the XTOP branch until the build and acceptance checks pass.
