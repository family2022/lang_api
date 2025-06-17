import React from 'react';

interface CustomTextInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | any>) => void;
  placeholder: string;
  label: string;
  type?: string;
  disabled?: boolean;
}

const CustomTextArea: React.FC<CustomTextInputProps> = ({ id, name, value, disabled, onChange, placeholder, label, type }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type ? type : 'text'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg outline-none focus:outline-none focus:border-main-orange bg-main-white"
        disabled={disabled}
      />
    </div>
  );
}

export default CustomTextArea;
