// components/ui/simple-checkbox/SimpleCheckbox.tsx

import { type JSX } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export interface SimpleOption {
  id: string;
  label: string;
}

interface SimpleCheckboxProps {
  options: SimpleOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  label?: string;
  error?: string;
}

export function SimpleCheckbox({ options, selectedIds, onChange, label, error }: SimpleCheckboxProps): JSX.Element {
  const handleToggle = (optionId: string, checked: boolean): void => {
    if (checked) {
      onChange([...selectedIds, optionId]);
    } else {
      onChange(selectedIds.filter((id) => id !== optionId));
    }
  };

  const isSelected = (optionId: string): boolean => {
    return selectedIds.includes(optionId);
  };

  return (
    <div className="border rounded-md p-4 ">
      {label && <div className="font-medium mb-3">{label}</div>}
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {options.map((option) => {
          const selected = isSelected(option.id);
          return (
            <div key={option.id} className="flex items-center gap-2">
              <Checkbox
                checked={selected}
                onChange={(e) => handleToggle(option.id, e.target.checked)}
                className="h-4 w-4 flex-shrink-0"
              />
              <span 
                className="text-sm cursor-pointer" 
                onClick={() => handleToggle(option.id, !selected)}
              >
                {option.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
