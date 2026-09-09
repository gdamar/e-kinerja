import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

interface SkorInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
}

export function SkorInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  error,
}: SkorInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (newValue: number) => {
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      handleChange(num);
    }
  };

  const handleBlur = () => {
    if (inputValue === '' || isNaN(parseInt(inputValue, 10))) {
      setInputValue(value.toString());
    }
  };

  const getColorClass = (score: number): string => {
    if (score >= 80) return 'text-status-success';
    if (score >= 60) return 'text-status-warning';
    return 'text-status-error';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleChange(value - 1)}
          disabled={value <= min}
          className="w-10 h-10 rounded-lg border border-input bg-surface flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>

        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          className={cn(
            'w-20 h-12 text-center text-xl font-bold rounded-lg border border-input bg-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            getColorClass(value),
            error && 'border-status-error'
          )}
        />

        <button
          type="button"
          onClick={() => handleChange(value + 1)}
          disabled={value >= max}
          className="w-10 h-10 rounded-lg border border-input bg-surface flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="text-sm text-status-error">{error}</p>}
    </div>
  );
}
