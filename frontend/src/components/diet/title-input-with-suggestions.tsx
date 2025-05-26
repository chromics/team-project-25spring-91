import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";

const DEFAULT_TITLE_SUGGESTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

interface TitleInputWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  enableSuggestions?: boolean;
  disabled?: boolean;
}

export const TitleInputWithSuggestions: React.FC<TitleInputWithSuggestionsProps> = ({
  value,
  onChange,
  maxLength = 50,
  placeholder = "Enter title",
  className,
  suggestions = DEFAULT_TITLE_SUGGESTIONS,
  enableSuggestions = true,
  disabled = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = value.trim() === ""
    ? suggestions
    : suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      );

  // Handle clicks outside the component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    if (enableSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [enableSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, maxLength);
    onChange(newValue);
    
    if (enableSuggestions) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (enableSuggestions) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    if (!enableSuggestions) return;
    
    // Only close if we're not in the middle of a mousedown inside the component
    if (!isMouseDown) {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 150);
    }
  };

  const shouldShowSuggestions = enableSuggestions && 
                                showSuggestions && 
                                filteredSuggestions.length > 0 && 
                                !disabled;

  return (
    <div 
      ref={wrapperRef} 
      className={cn("relative w-full", className)}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
    >
      <Input 
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full"
        maxLength={maxLength}
        disabled={disabled}
      />
      
      {shouldShowSuggestions && (
        <div className="absolute z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md mt-1">
          <ScrollArea className="max-h-40 overflow-auto" type="auto">
            <div className="p-1">
              {filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    value === suggestion ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default TitleInputWithSuggestions;
