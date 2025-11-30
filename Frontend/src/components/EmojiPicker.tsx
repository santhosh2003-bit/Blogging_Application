import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import Draggable from "react-draggable";
import { Smile, X } from "lucide-react";

interface Props {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPickerComponent({ onEmojiSelect }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const nodeRef = useRef(null);

  const handleEmojiClick = (emojiData: any) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-1 rounded hover:bg-gray-200"
        title="Insert Emoji"
      >
        <Smile className="w-4 h-4" />
      </button>

      {showPicker && (
        <Draggable nodeRef={nodeRef} handle=".emoji-picker-handle">
          <div
            ref={nodeRef}
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="emoji-picker-handle bg-gray-100 p-2 rounded-t-lg cursor-move flex justify-between items-center">
              <span className="text-sm font-medium">Emoji Picker</span>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
}
