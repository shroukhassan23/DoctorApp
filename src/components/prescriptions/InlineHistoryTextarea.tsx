import React, { useState, useRef, useMemo } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchText } from '@/lib/arabicUtils';

interface InlineHistoryTextareaProps {
  items: string[];
  onSelect: (value: string) => void;
  onDelete?: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  historyType?: string;
}

export const InlineHistoryTextarea = ({ 
  items, 
  onSelect, 
  onDelete, 
  value, 
  onChange, 
  placeholder,
  className,
  id,
  historyType
}: InlineHistoryTextareaProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use useMemo to prevent re-calculation on every render
  const filteredItems = useMemo(() => {
    if (!value.trim() || !items || items.length === 0) {
      return [];
    }
    return items.filter(item => searchText(value, item));
  }, [value, items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    if (filteredItems.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the new focus target is within our container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setShowDropdown(false);
    }
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setShowDropdown(false);
  };

  const handleDelete = (e: React.MouseEvent, itemToDelete: string) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(itemToDelete);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <textarea
        id={id}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      
      {showDropdown && filteredItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg">
          <Command shouldFilter={false}>
            <CommandList className="max-h-60">
              <CommandGroup>
                {filteredItems.map((item, index) => (
                  <CommandItem
                    key={`${item}-${index}`}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer flex items-center gap-2 group"
                  >
                    <span className="truncate flex-1">{item}</span>
                    {onDelete && (
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 rounded-sm p-1 transition-opacity"
                        onClick={(e) => handleDelete(e, item)}
                        title="Delete this entry"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};