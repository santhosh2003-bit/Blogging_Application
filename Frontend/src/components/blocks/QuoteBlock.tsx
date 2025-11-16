import TipTap from "../TipTap";
import ReadOnlyTipTap from "../ReadOnlyTipTap";
import { type Block } from "../../types";

interface Props {
  block: Block;
  onUpdate: (content: any) => void;
  readOnly?: boolean;
}

export default function QuoteBlock({
  block,
  onUpdate,
  readOnly = false,
}: Props) {
  return (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">
      {readOnly ? (
        <ReadOnlyTipTap content={block.content} />
      ) : (
        <TipTap
          content={block.content}
          onChange={onUpdate}
          placeholder="Enter quote..."
        />
      )}
    </blockquote>
  );
}
