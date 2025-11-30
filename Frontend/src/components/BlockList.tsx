import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Block } from "../types";
import BlockRenderer from "./BlockRenderer";
import { GripVertical } from "lucide-react";

interface SortableBlockProps {
  block: Block;
  onUpdate: (id: string, content: any, attrs?: any) => void;
  onDelete: (id: string) => void;
}

function SortableBlock({ block, onUpdate, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative mb-4">
      <div className="absolute left-0 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div {...attributes} {...listeners}>
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
        </div>
      </div>
      <div className="pl-8">
        <BlockRenderer block={block} onUpdate={onUpdate} />
      </div>
      <button
        onClick={() => onDelete(block.id)}
        className="absolute right-2 top-2 text-red-500 opacity-0 group-hover:opacity-100 text-xl"
      >
        ×
      </button>
    </div>
  );
}

interface Props {
  blocks: Block[];
  onReorder: (blocks: Block[]) => void;
  onUpdate: (id: string, content: any, attrs?: any) => void;
  onDelete: (id: string) => void;
}

export default function BlockList({
  blocks,
  onReorder,
  onUpdate,
  onDelete,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onReorder(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {blocks.map((block) => (
          <SortableBlock
            key={block.id}
            block={block}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
