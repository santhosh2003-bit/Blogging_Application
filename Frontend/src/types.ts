export interface Block {
  id: string;
  type: BlockType;
  content: any;
  attrs?: {
    src?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
    [key: string]: any;
  };
}

export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "video"
  | "quote"
  | "divider"
  | "bulletList"
  | "orderedList";

export interface Comment {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  size: number;
  alt?: string;
  caption?: string;
  uploadedAt?: string;
}

export interface UploadProgress {
  id: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export interface BlogPost {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  blocks: Block[];
  status: "draft" | "published";
  publishedAt?: string;
  comments: Comment[];
  viewCount?: number;
  author?: Author;
  tags?: string[];
  likes?: string[];
}

interface Author {
  id: string;
  name: string;
}
