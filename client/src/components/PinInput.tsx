import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
}

export function PinInput({ length = 6, onComplete, disabled = false }: PinInputProps) {
  const [pins, setPins] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, "");
    if (digit.length > 1) return;

    const newPins = [...pins];
    newPins[index] = digit;
    setPins(newPins);

    // Move to next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if PIN is complete
    if (newPins.every((pin) => pin !== "") && newPins.join("").length === length) {
      onComplete(newPins.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Move to previous input on backspace
    if (e.key === "Backspace" && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/[^0-9]/g, "").slice(0, length);

    if (digits.length === length) {
      const newPins = digits.split("");
      setPins(newPins);
      inputRefs.current[length - 1]?.focus();
      onComplete(digits);
    }
  };

  return (
    <div className="flex gap-2 justify-center" data-testid="pin-input-container">
      {pins.map((pin, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={pin}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 text-center text-lg font-semibold"
          data-testid={`pin-input-${index}`}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
