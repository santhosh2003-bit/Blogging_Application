import { useState } from "react";

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  onClose: () => void;
  title: string;
  initialColor?: string;
}

const predefinedColors = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#800000",
  "#008000",
  "#000080",
  "#808000",
  "#800080",
  "#008080",
  "#C0C0C0",
  "#808080",
  "#FFA500",
  "#A52A2A",
  "#DC143C",
  "#FF69B4",
  "#8A2BE2",
  "#5F9EA0",
  "#D2691E",
  "#FF6347",
];

export default function ColorPicker({
  onColorSelect,
  onClose,
  title,
  initialColor = "#000000",
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [customColor, setCustomColor] = useState(initialColor);

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
    onColorSelect(color);
    // Don't close immediately, let user see the selection
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setSelectedColor(newColor);
    onColorSelect(newColor);
  };

  const handleApply = () => {
    onColorSelect(customColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 rounded-lg p-6 w-80 max-w-sm shadow-lg">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Predefined Colors
          </label>
          <div className="grid grid-cols-8 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                className={`w-8 h-8 rounded border-2 ${
                  selectedColor === color
                    ? "border-gray-800"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Custom Color</label>
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-full h-10 border border-gray-300 rounded"
            title="Custom Color Picker"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Hex/RGB Value
          </label>
          <input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="#000000 or rgb(0,0,0)"
            title="Hex or RGB Color Value"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
