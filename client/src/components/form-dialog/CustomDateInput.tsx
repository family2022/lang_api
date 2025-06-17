import React from 'react';

interface CustomDateInputProps {
  name: string;
  value: string; // Expects a date or a timestamp
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  disabled?: boolean;
}

// Format the date to YYYY-MM-DD if it includes a timestamp
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0]; // Extract date part only
};

const CustomDateInput: React.FC<CustomDateInputProps> = ({ name, value, onChange, label, disabled }) => {
  const formattedValue = formatDate(value); // Format the incoming value to YYYY-MM-DD

  return (
    <div>
      <label>{label} <em>(MM/DD/YYYY)</em></label>
      <input
        type="date"
        name={name}
        value={formattedValue}
        onChange={onChange} // Pass the change event directly
        style={{
          width: "100%",
          padding: "8px",
          marginTop: "4px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded-lg outline-none focus:outline-none focus:border-main-orange bg-main-white"
      />
    </div>
  );
}

export default CustomDateInput;
