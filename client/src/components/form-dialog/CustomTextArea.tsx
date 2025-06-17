import React from 'react';

interface CustomTextInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  label: string;
  type?: string;
  disabled?: boolean;
}

const CustomTextArea: React.FC<CustomTextInputProps> = ({ id, name, value, onChange, placeholder, label, type, disabled }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={15}
        className="w-full px-3 py-2 border rounded-lg outline-none focus:outline-none focus:border-main-orange bg-main-white"
        disabled={disabled}
      ></textarea>
    </div>
  );
}

export default CustomTextArea;
