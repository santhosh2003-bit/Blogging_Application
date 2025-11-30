import { X, Upload, Video, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { MediaItem, UploadProgress } from "../types";
import {
  simulateUpload,
  getMediaLibrary,
  addToMediaLibrary,
  deleteFromMediaLibrary,
} from "../utils/uploadUtils";

interface Props {
  isOpen: boolean;
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
}

export default function MediaLibrary({ isOpen, onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("mediaLibrary");
    console.log("RAW LOCAL STORAGE:", stored);

    const parsed = getMediaLibrary();
    console.log("PARSED MEDIA LIBRARY:", parsed);

    setItems(parsed);
  }, []);

  useEffect(() => {
    console.log("STATE ITEMS:", items);
  }, [items]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const mediaItem = await simulateUpload(
          file,
          (progress: UploadProgress) => {
            setUploads((prev) => {
              const existing = prev.find((u) => u.id === progress.id);
              if (existing) {
                return prev.map((u) => (u.id === progress.id ? progress : u));
              }
              return [...prev, progress];
            });
          }
        );
        addToMediaLibrary(mediaItem);
        setItems((prev) => [mediaItem, ...prev]);
        setUploads((prev) => prev.filter((u) => u.id !== mediaItem.id));
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  const handleDelete = (id: string) => {
    deleteFromMediaLibrary(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Media Library</h2>
          <button
            title="x mark button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <input
            placeholder="Select the File "
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
        </div>

        {uploads.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="font-medium mb-2">Uploads</h3>
            <div className="space-y-2">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {upload.progress}%
                  </span>
                  {upload.status === "error" && (
                    <span className="text-red-600 text-sm">{upload.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 overflow-y-auto max-h-96">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No media items yet. Upload some files to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative group border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelect(item)}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <button
                      title="Delete Button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-red-600 text-white rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {(item.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
