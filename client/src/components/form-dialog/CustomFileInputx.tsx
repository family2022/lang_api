import React, { useState } from 'react';

interface CustomFileInputProps {
  id: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  // resetKey: string; // a key to force re-render
  single?: boolean
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({
  id,
  name,
  onChange,
  label,
  single
  // resetKey
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        id={id}
        name={name}
        onChange={onChange}
        multiple={!single}
        // key={resetKey}  // Using key to force re-render
        className="w-full px-3 py-2 border rounded-lg outline-none focus:outline-none focus:border-main-orange bg-main-white"
      />
    </div>
  );
}

export default CustomFileInput;
