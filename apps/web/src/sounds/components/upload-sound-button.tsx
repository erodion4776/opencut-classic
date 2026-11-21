"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/editor/use-editor";
import { useFileUpload } from "@/media/use-file-upload";
import { processMediaAssets } from "@/media/processing";
import { showMediaUploadToast } from "@/media/upload-toast";
import { buildElementFromMedia } from "@/timeline/element-utils";
import { DEFAULT_NEW_ELEMENT_DURATION } from "@/timeline/creation";
import { mediaTimeFromSeconds } from "@/wasm";
import { toast } from "sonner";
import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function UploadSoundButton() {
 const editor = useEditor();
 const activeProject = useEditor((e) => e.project.getActive());
 const [uploading, setUploading] = useState(false);

 const importFiles = async (files: File[]) => {
  if (!activeProject) {
   toast.error("Open a project before uploading audio");
   return;
  }
  setUploading(true);
  try {
   await showMediaUploadToast({
    filesCount: files.length,
    promise: async () => {
     const assets = await processMediaAssets({ files });
     let uploadedCount = 0;
     const names: string[] = [];
     for (const asset of assets) {
      if (asset.type !== "audio") continue;
      const saved = await editor.media.addMediaAsset({
       projectId: activeProject.metadata.id,
       asset,
      });
      if (!saved) continue;
      const duration = saved.duration
       ? mediaTimeFromSeconds({ seconds: saved.duration })
       : DEFAULT_NEW_ELEMENT_DURATION;
      const element = buildElementFromMedia({
       mediaId: saved.id,
       mediaType: "audio",
       name: saved.name,
       duration,
       startTime: editor.playback.getCurrentTime(),
      });
      editor.timeline.insertElement({
       element,
       placement: { mode: "auto", trackType: "audio" },
      });
      uploadedCount += 1;
      names.push(saved.name);
     }
     return { uploadedCount, assetNames: names };
    },
   });
  } catch (error) {
   console.error("Audio upload failed:", error);
   toast.error(error instanceof Error ? error.message : "Audio upload failed");
  } finally {
   setUploading(false);
  }
 };

 const { openFilePicker, fileInputProps } = useFileUpload({
  accept: "audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac",
  multiple: true,
  onFilesSelected: importFiles,
 });

 return (
  <>
   <input {...fileInputProps} />
   <Button size="sm" variant="outline" onClick={openFilePicker} disabled={uploading}>
    <HugeiconsIcon icon={CloudUploadIcon} className="mr-1 size-4" />
    {uploading ? "Uploading..." : "Upload sound"}
   </Button>
  </>
 );
}
