
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { History, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryDropdownProps {
  items: string[];
  onSelect: (value: string) => void;
  onDelete?: (value: string) => void;
  placeholder?: string;
}

export const HistoryDropdown = ({ items, onSelect, onDelete, placeholder = "Search previous entries..." }: HistoryDropdownProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(value);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0"
          type="button"
          title="Search previous entries"
        >
          <History className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Command shouldFilter={true}>
          <CommandInput 
            placeholder={placeholder}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-60">
            <CommandEmpty>No previous entries found.</CommandEmpty>
            <CommandGroup heading="Previously Used">
              {items.map((item, index) => (
                <CommandItem
                  key={index}
                  value={item}
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer flex items-center gap-2 group"
                >
                  <Check className="h-4 w-4 opacity-0" />
                  <span className="truncate flex-1">{item}</span>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                      onClick={(e) => handleDelete(e, item)}
                      title="Delete this entry"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
