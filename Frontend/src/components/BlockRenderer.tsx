import { type Block } from "../types";
import TipTap from "./TipTap";
import ReadOnlyTipTap from "./ReadOnlyTipTap";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import DividerBlock from "./blocks/DividerBlock";

interface Props {
  block: Block;
  onUpdate: (id: string, content: any, attrs?: any) => void;
  readOnly?: boolean;
}

export default function BlockRenderer({
  block,
  onUpdate,
  readOnly = false,
}: Props) {
  const handleContent = (content: any) => onUpdate(block.id, content);
  const handleAttrs = (attrs: any) => onUpdate(block.id, block.content, attrs);

  switch (block.type) {
    case "paragraph":
    case "heading":
    case "bulletList":
    case "orderedList":
      return readOnly ? (
        <ReadOnlyTipTap content={block.content} />
      ) : (
        <TipTap content={block.content} onChange={handleContent} />
      );

    case "image":
      return (
        <ImageBlock block={block} onUpdate={handleAttrs} readOnly={readOnly} />
      );

    case "video":
      return (
        <VideoBlock block={block} onUpdate={handleAttrs} readOnly={readOnly} />
      );

    case "quote":
      return (
        <QuoteBlock
          block={block}
          onUpdate={handleContent}
          readOnly={readOnly}
        />
      );

    case "divider":
      return <DividerBlock />;

    default:
      return null;
  }
}
