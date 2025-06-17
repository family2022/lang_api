import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface CustomRichTextEditorProps {
  id: string;
  name: string;
  value?: string;
  onChange: (event: any) => void;
  placeholder?: string;
  label: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<CustomRichTextEditorProps> = ({
  id,
  name,
  value = '',
  onChange,
  placeholder,
  label,
  disabled,
}) => {
  const [editorContent, setEditorContent] = useState(value);

  // Update local editor content when value prop changes (e.g., on edit)
  useEffect(() => {
    setEditorContent(value);
  }, [value]);

  const handleChange = (content: string, delta: any, source: string, editor: any) => {
    setEditorContent(content);
    onChange({
      target: {
        name,
        value: content,
      },
    });
  };

  return (
    <div className="mb-12">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <ReactQuill
        value={editorContent}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={disabled}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
        }}
        className="w-full h-64"
      />
    </div>
  );
};

export default RichTextEditor;
