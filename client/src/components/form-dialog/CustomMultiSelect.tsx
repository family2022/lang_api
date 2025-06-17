import React from 'react';

export interface Option {
  value: string;
  label: string;
}

interface CustomMultiSelectProps {
  value: string[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  label: string;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({ value, onChange, options, label }) => {
  return (
    <div>
      <label>{label}</label>
      <select
        multiple
        value={value}
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
          onChange(selectedOptions as any);
        }}
        style={{ width: "100%", padding: "8px", marginTop: "4px" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CustomMultiSelect;
