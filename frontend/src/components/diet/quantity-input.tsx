import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  autoFocus?: boolean;
  showUnit?: boolean;
  unitText?: string;
}

const MAX_QUANTITY = 2000;

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  disabled = false,
  className = "w-full",
  min = 1,
  max = MAX_QUANTITY,
  autoFocus = false,
  showUnit = false,
  unitText = "gram"
}) => {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      onChange(0);
    } else {
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val >= 0 && val <= max) {
        onChange(val);
      }
    }
  };

  const handleBlur = () => {
    if (value < min) {
      onChange(min);
    }
    // Force blur to remove focus
    if (inputRef) {
      inputRef.blur();
    }
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown?.(e);
  };

  return (
    <div className="flex items-center space-x-1">
      <Input
        ref={setInputRef}
        type="number"
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        className={className}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {showUnit && (
        <span className="text-sm text-muted-foreground mr-2">{unitText}</span>
      )}
    </div>
  );
};
