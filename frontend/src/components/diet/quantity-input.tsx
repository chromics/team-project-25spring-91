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
const DEFAULT_QUANTITY = 1;
const EMPTY_INPUT_DEFAULT = 1;

const formatPlaceholder = (value: number): string => {
  // If it's a whole number, show .00
  if (value % 1 === 0) {
    return `${value}.00`;
  }
  // If it has decimals, show as is
  return value.toString();
};

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  disabled = false,
  className = "w-full",
  min = 0.01,
  max = MAX_QUANTITY,
  autoFocus = false,
  showUnit = false,
  unitText = "gram"
}) => {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [displayValue, setDisplayValue] = useState<string>(value.toString());

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const isValidInput = (inputValue: string): boolean => {
    if (inputValue === '' || inputValue === '.') {
      return true;
    }

    const decimalRegex = /^(?:0(?:\.\d{0,3})?|[1-9]\d*(?:\.\d{0,3})?)$/;
    
    return decimalRegex.test(inputValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (!isValidInput(inputValue)) {
      return;
    }

    setDisplayValue(inputValue);

    if (inputValue === '' || inputValue === '.') {
      onChange(0);
      return;
    }

    const val = parseFloat(inputValue);
    if (!isNaN(val) && val >= 0 && val <= max) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    let finalValue = value;
    
    // If empty or 0, set to default
    if (value === 0 || displayValue === '' || displayValue === '.') {
      finalValue = EMPTY_INPUT_DEFAULT;
      onChange(finalValue);
    } else if (value > 0 && value < min) {
      finalValue = min;
      onChange(finalValue);
    } else {
      finalValue = value;
    }
    
    // Round to 2 decimal places if more than 2 decimal places
    finalValue = Math.round(finalValue * 100) / 100;
    setDisplayValue(finalValue.toString());
    
    if (inputRef) {
      inputRef.blur();
    }
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    const allowedCtrlKeys = ['a', 'c', 'v', 'x', 'z'];
    
    // Block comma key
    if (e.key === ',') {
      e.preventDefault();
      onKeyDown?.(e);
      return;
    }

    // Handle decimal point
    if (e.key === '.') {
      // Block multiple periods
      if (displayValue.includes('.')) {
        e.preventDefault();
        onKeyDown?.(e);
        return;
      }
      onKeyDown?.(e);
      return;
    }
    
    // Handle numbers
    if (/^[0-9]$/.test(e.key)) {
      const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;
      const newValue = displayValue.slice(0, cursorPosition) + e.key + displayValue.slice(cursorPosition);
      
      if (!isValidInput(newValue)) {
        e.preventDefault();
        onKeyDown?.(e);
        return;
      }
      
      onKeyDown?.(e);
      return;
    }
    
    if (allowedKeys.includes(e.key)) {
      onKeyDown?.(e);
      return;
    }

    if (e.ctrlKey && allowedCtrlKeys.includes(e.key.toLowerCase())) {
      onKeyDown?.(e);
      return;
    }

    e.preventDefault();
    onKeyDown?.(e);
  };

  return (
    <div className="flex items-center space-x-1">
      <Input
        ref={setInputRef}
        type="text" 
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={formatPlaceholder(DEFAULT_QUANTITY)}
      />
      {showUnit && (
        <span className="text-sm text-muted-foreground mr-2">{unitText}</span>
      )}
    </div>
  );
};

export { DEFAULT_QUANTITY, EMPTY_INPUT_DEFAULT };
