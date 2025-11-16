import {
  Plus,
  Type,
  Image,
  Video,
  Quote,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";
import { type BlockType } from "../types";

interface Props {
  onAddBlock: (type: BlockType) => void;
}

const blockButtons: {
  type: BlockType;
  icon: React.ReactNode;
  label: string;
}[] = [
  { type: "heading", icon: <Type className="w-5 h-5" />, label: "Heading" },
  { type: "paragraph", icon: <Type className="w-5 h-5" />, label: "Text" },
  { type: "image", icon: <Image className="w-5 h-5" />, label: "Image" },
  { type: "video", icon: <Video className="w-5 h-5" />, label: "Video" },
  { type: "quote", icon: <Quote className="w-5 h-5" />, label: "Quote" },
  {
    type: "bulletList",
    icon: <List className="w-5 h-5" />,
    label: "Bullet List",
  },
  {
    type: "orderedList",
    icon: <ListOrdered className="w-5 h-5" />,
    label: "Numbered List",
  },
  { type: "divider", icon: <Minus className="w-5 h-5" />, label: "Divider" },
];

export default function Sidebar({ onAddBlock }: Props) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add Block
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {blockButtons.map((b) => (
          <button
            key={b.type}
            onClick={() => onAddBlock(b.type)}
            className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-blue-50 border border-gray-200 transition-colors"
          >
            {b.icon}
            <span className="text-sm">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
