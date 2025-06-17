import React, { useState } from 'react';

interface CustomAutocompleteProps {
  label: string;
  suggestions: string[];
  fetchFunc: (query: string) => void;
  onSelect: (value: string) => void;
}

const CustomAutocomplete: React.FC<CustomAutocompleteProps> = ({ label, suggestions, fetchFunc, onSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <label>{label}</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          fetchFunc(e.target.value);
        }}
        style={{ width: "100%", padding: "8px", marginTop: "4px" }}
      />
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index} onClick={() => onSelect(suggestion)}>
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomAutocomplete;
