import * as React from 'react';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface AutocompleteOption<T = unknown> {
  value: string;
  label: string;
  keywords?: string[];
  data?: T;
}

export interface AutocompleteProps<T = unknown> {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: AutocompleteOption<T>[];
  onSelect: (option: AutocompleteOption<T>) => void;
  placeholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  shouldFilter?: boolean;
  error?: string;
  disabled?: boolean;
  modal?: boolean;
  icon?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  renderOption?: (option: AutocompleteOption<T>) => React.ReactNode;
}

/**
 * Universal autocomplete input built on Input + PopoverAnchor + CommandList.
 * Supports both client-side filtering (default) and external/async filtering (shouldFilter={false}).
 */
export function Autocomplete<T = unknown>({
  id,
  value,
  onValueChange,
  options,
  onSelect,
  placeholder = 'Cari...',
  emptyMessage = 'Tidak ada hasil ditemukan.',
  isLoading = false,
  shouldFilter = true,
  error,
  disabled = false,
  modal = false,
  icon,
  className,
  itemClassName,
  renderOption,
}: AutocompleteProps<T>) {
  const [open, setOpen] = React.useState(false);

  const filteredOptions = React.useMemo(() => {
    if (!shouldFilter) return options;
    const query = value.trim().toLowerCase();
    if (!query) return options;

    return options.filter((option) => {
      if (option.label.toLowerCase().includes(query)) return true;
      return option.keywords?.some((kw) => kw.toLowerCase().includes(query)) ?? false;
    });
  }, [options, shouldFilter, value]);

  // For async mode (shouldFilter=false), open automatically when results arrive for non-empty input
  React.useEffect(() => {
    if (!shouldFilter) {
      setOpen(options.length > 0 && value.trim().length > 0);
    }
  }, [options.length, shouldFilter, value]);

  const showPopover = open && (shouldFilter || filteredOptions.length > 0);

  return (
    <Popover open={showPopover} onOpenChange={setOpen} modal={modal}>
      <PopoverAnchor asChild>
        <div>
          <Input
            id={id}
            value={value}
            onChange={(e) => {
              const nextValue = e.target.value;
              onValueChange(nextValue);
              if (shouldFilter) {
                setOpen(true);
              } else if (!nextValue.trim()) {
                setOpen(false);
              }
            }}
            onFocus={() => {
              if (shouldFilter || options.length > 0) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            icon={
              isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                icon ?? <Search className="h-4 w-4" />
              )
            }
            error={error}
            disabled={disabled}
            className={cn('pr-10', className)}
            autoComplete="off"
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-60">
            {shouldFilter && filteredOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn('cursor-pointer', itemClassName)}
                  >
                    {renderOption ? renderOption(option) : option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
