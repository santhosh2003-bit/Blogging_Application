/* eslint-disable */
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Resizable } from "re-resizable";
import type { Block, MediaItem, UploadProgress } from "../../types";
import {
  validateFile,
  simulateUpload,
  addToMediaLibrary,
} from "../../utils/uploadUtils";
import MediaLibrary from "../MediaLibrary";

interface Props {
  block: Block;
  onUpdate: (content: any) => void;
  readOnly?: boolean;
}

export default function ImageBlock({
  block,
  onUpdate,
  readOnly = false,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const src = block.attrs?.src || "";
  const alt = block.attrs?.alt || "";
  const caption = block.attrs?.caption || "";
  const width = block.attrs?.width || 300;
  const height = block.attrs?.height || 200;
  // Local size for live-resize preview. Keep in sync with attrs.
  const [localSize, setLocalSize] = useState({ width, height });

  useEffect(() => {
    setLocalSize({ width, height });
  }, [width, height]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }

      setIsUploading(true);
      try {
        const mediaItem = await simulateUpload(file, (progress) => {
          setUploadProgress(progress);
        });

        addToMediaLibrary(mediaItem);
        onUpdate({
          src: mediaItem.url,
          alt: mediaItem.alt || "",
          caption: mediaItem.caption || "",
        });
      } catch {
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [onUpdate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleLibrarySelect = (item: MediaItem) => {
    onUpdate({
      src: item.url,
      alt: item.alt || "",
      caption: item.caption || "",
    });
    setIsLibraryOpen(false);
  };

  const handleAltChange = (value: string) => {
    onUpdate({ ...block.attrs, alt: value });
  };

  const handleCaptionChange = (value: string) => {
    onUpdate({ ...block.attrs, caption: value });
  };

  // Update preview live while resizing, persist on stop
  const handleResize = (_event: any, _direction: any, _ref: any, d: any) => {
    setLocalSize({
      width: Math.max(100, width + d.width),
      height: Math.max(100, height + d.height),
    });
  };

  const handleResizeStop = (
    _event: any,
    _direction: any,
    _ref: any,
    d: any
  ) => {
    const newW = Math.max(100, width + d.width);
    const newH = Math.max(100, height + d.height);
    setLocalSize({ width: newW, height: newH });
    onUpdate({ ...block.attrs, width: newW, height: newH });
  };

  // If readOnly and no image, don't render anything
  if (readOnly && !src) return null;

  return (
    <div className="my-4">
      {src ? (
        <div className="space-y-2 flex flex-col items-center">
          {!readOnly ? (
            <Resizable
              size={{ width: localSize.width, height: localSize.height }}
              onResize={handleResize}
              onResizeStop={handleResizeStop}
              minWidth={100}
              minHeight={100}
              maxWidth={800}
              maxHeight={600}
              className="inline-block"
            >
              <img
                src={src}
                alt={alt}
                className="w-full h-full rounded shadow-sm"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Resizable>
          ) : (
            <img
              src={src}
              alt={alt}
              style={{ width: `${width}px`, height: `${height}px` }}
              className="rounded shadow-sm"
            />
          )}
          {caption && (
            <p className="text-sm text-gray-600 text-center italic">
              {caption}
            </p>
          )}
          {!readOnly && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Alt text"
                value={alt}
                onChange={(e) => handleAltChange(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border rounded"
              />
              <input
                type="text"
                placeholder="Caption"
                value={caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border rounded"
              />
              <button
                onClick={() => onUpdate({})}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <p className="text-sm text-gray-600">
                  Uploading... {uploadProgress?.progress.toFixed(0)}%
                </p>
                {uploadProgress && (
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-2">
                    {/* eslint-disable-next-line */}
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? "Drop the image here..."
                    : "Drag & drop an image, or click to select"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports JPG, PNG, GIF, WebP (max 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Choose from Library
            </button>
          </div>
        </div>
      )}

      <MediaLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleLibrarySelect}
      />
    </div>
  );
}
