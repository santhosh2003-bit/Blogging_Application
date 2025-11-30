// import type { MediaItem, UploadProgress } from "../types";

// export const compressImage = (
//   file: File,
//   maxWidth: number = 1200,
//   quality: number = 0.8
// ): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     const img = new Image();

//     img.onload = () => {
//       const ratio = Math.min(maxWidth / img.width, 1);
//       canvas.width = img.width * ratio;
//       canvas.height = img.height * ratio;

//       ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result as string);
//             reader.readAsDataURL(blob);
//           } else {
//             reject(new Error("Compression failed"));
//           }
//         },
//         "image/jpeg",
//         quality
//       );
//     };

//     img.onerror = () => reject(new Error("Image load failed"));
//     img.src = URL.createObjectURL(file);
//   });
// };

// export const validateFile = (file: File): string | null => {
//   const maxSize = 10 * 1024 * 1024; // 10MB
//   const allowedTypes = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/gif",
//     "image/webp",
//     "video/mp4",
//     "video/webm",
//     "video/ogg",
//   ];

//   if (file.size > maxSize) {
//     return "File size must be less than 10MB";
//   }

//   if (!allowedTypes.includes(file.type)) {
//     return "Unsupported file type";
//   }

//   return null;
// };

// // export const simulateUpload = (
// //   file: File,
// //   onProgress: (progress: UploadProgress) => void
// // ): Promise<MediaItem> => {
// //   return new Promise(async (resolve, reject) => {
// //     const id = Date.now().toString();
// //     let dataUrl: string;

// //     try {
// //       if (file.type.startsWith("image/")) {
// //         dataUrl = await compressImage(file);
// //       } else {
// //         // For videos, just convert to base64 (no compression)
// //         dataUrl = await new Promise((res, rej) => {
// //           const reader = new FileReader();
// //           reader.onload = () => res(reader.result as string);
// //           reader.onerror = () => rej(new Error("File read failed"));
// //           reader.readAsDataURL(file);
// //         });
// //       }

// //       // Simulate upload progress
// //       let progress = 0;
// //       const interval = setInterval(() => {
// //         progress += Math.random() * 20;
// //         if (progress >= 100) {
// //           progress = 100;
// //           clearInterval(interval);

// //           const mediaItem: MediaItem = {
// //             id,
// //             name: file.name,
// //             url: dataUrl,
// //             type: file.type.startsWith("image/") ? "image" : "video",
// //             size: file.size,
// //             uploadedAt: new Date().toISOString(),
// //           };

// //           onProgress({ id, progress: 100, status: "completed" });
// //           resolve(mediaItem);
// //         } else {
// //           onProgress({ id, progress, status: "uploading" });
// //         }
// //       }, 200);
// //     } catch (error) {
// //       onProgress({
// //         id,
// //         progress: 0,
// //         status: "error",
// //         error: error instanceof Error ? error.message : "Upload failed",
// //       });
// //       reject(error);
// //     }
// //   });
// // };

// export const simulateUpload = (
//   file: File,
//   onProgress: (progress: UploadProgress) => void
// ): Promise<MediaItem> => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const id = Date.now().toString();

//       let progress = 0;
//       const interval = setInterval(() => {
//         progress += Math.random() * 15;
//         if (progress >= 95) progress = 95;

//         onProgress({ id, progress, status: "uploading" });
//       }, 200);

//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await fetch("/api/media/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       clearInterval(interval);

//       onProgress({ id, progress: 100, status: "completed" });

//       resolve({
//         id: data.public_id,
//         name: file.name,
//         url: data.url,
//         type: data.type,
//         size: file.size,
//         uploadedAt: new Date().toISOString(),
//       });
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// // export const getMediaLibrary = (): MediaItem[] => {
// //   const stored = localStorage.getItem("mediaLibrary");
// //   return stored ? JSON.parse(stored) : [];
// // };

// // export const saveMediaLibrary = (items: MediaItem[]) => {
// //   localStorage.setItem("mediaLibrary", JSON.stringify(items));
// // };

// // export const addToMediaLibrary = (item: MediaItem) => {
// //   const library = getMediaLibrary();
// //   library.push(item);
// //   saveMediaLibrary(library);
// // };

// // export const deleteFromMediaLibrary = (id: string) => {
// //   const library = getMediaLibrary();
// //   const updated = library.filter((item) => item.id !== id);
// //   saveMediaLibrary(updated);
// // };

// export const deleteFromMediaLibrary = async (public_id: string) => {
//   await fetch(`/api/media/${public_id}`, { method: "DELETE" });
// };

import type { MediaItem, UploadProgress } from "../types";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
/* ------------------- KEEP compressImage (unused) ------------------- */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
};

/* ------------------- VALIDATE FILE ------------------- */
export const validateFile = (file: File): string | null => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  if (file.size > maxSize) return "File must be less than 50MB";
  if (!allowedTypes.includes(file.type)) return "Unsupported file type";

  return null;
};

/* ------------------- SIMULATED UPLOAD + REAL CLOUDINARY UPLOAD ------------------- */
export const simulateUpload = (
  file: File,
  onProgress: (progress: UploadProgress) => void
): Promise<MediaItem> => {
  return new Promise(async (resolve, reject) => {
    try {
      const id = Date.now().toString();

      // Simulated progress bar
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 95) progress = 95;

        onProgress({ id, progress, status: "uploading" });
      }, 200);

      // Real Cloudinary upload via backend
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND_URL}/api/media/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      clearInterval(interval);

      onProgress({ id, progress: 100, status: "completed" });

      // Final media item
      const mediaItem: MediaItem = {
        id: data.public_id,
        name: file.name,
        url: data.url,
        type: data.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      // Save to localStorage
      // addToMediaLibrary(mediaItem);

      resolve(mediaItem);
    } catch (err) {
      reject(err);
    }
  });
};

/* ------------------- LOCAL STORAGE LIBRARY ------------------- */

export const getMediaLibrary = (): MediaItem[] => {
  const stored = localStorage.getItem("mediaLibrary");
  return stored ? JSON.parse(stored) : [];
};

export const addToMediaLibrary = (item: MediaItem) => {
  const library = getMediaLibrary();
  library.unshift(item);
  localStorage.setItem("mediaLibrary", JSON.stringify(library));
};

export const deleteFromMediaLibrary = async (public_id: string) => {
  // Remove from Cloudinary
  await fetch(`${BACKEND_URL}/api/media/${public_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Remove from localStorage
  const library = getMediaLibrary();
  const updated = library.filter((item) => item.id !== public_id);
  localStorage.setItem("mediaLibrary", JSON.stringify(updated));
};
