
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export const AutocompleteInput = ({ 
  value, 
  onChange, 
  suggestions, 
  placeholder,
  className 
}: AutocompleteInputProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    setOpen(newValue.length > 0 && filteredSuggestions.length > 0);
  };

  const handleSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          onFocus={() => setOpen(inputValue.length > 0 && filteredSuggestions.length > 0)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandList>
            {filteredSuggestions.length > 0 ? (
              <CommandGroup>
                {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>No suggestions found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
