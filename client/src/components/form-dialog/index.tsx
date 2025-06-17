import React, { Dispatch, useState } from "react";
import CustomModal from "./CustomModel";
import CustomSelect from "./CustomSelect";
import CustomMultiSelect from "./CustomMultiSelect";
import CustomAutocomplete from "./CustomAutoComplete";
import CustomTextInput from "./CustomTextInput";
import CustomDateInput from "./CustomDateInput";
import { RiCloseCircleFill } from "react-icons/ri";
import CustomTextArea from "./CustomTextArea";
import CustomFileInput from "./CustomFileInputx";
import RichTextEditor from "./Richtext";

interface Option {
  value: string;
  label: string;
}

interface Field {
  name: string;
  type: string;
  inputType?: string;
  label: string;
  options?: Option[];
  single?: boolean;
  suggestions?: string[];
  fetchFunc?: (query: string) => void;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  require?: boolean;
}

interface FormDialogProps {
  open: boolean;
  handleClose: () => void;
  data: { [key: string]: any };
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | any>
  ) => void;
  setData?: Dispatch<any>;
  handleFormSubmit: () => void;
  fields: Field[];
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  handleClose,
  data,
  onChange,
  handleFormSubmit,
  setData,
  fields,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(data.tags || []);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleFormSubmit();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title={
        data.id ? (
          <div className="w-full flex justify-between">
            <span>Update</span>{" "}
            <RiCloseCircleFill
              onClick={handleClose}
              className="hover:cursor-pointer"
            />
          </div>
        ) : (
          <div className="w-full flex justify-between">
            <span>Create</span>{" "}
            <RiCloseCircleFill
              onClick={handleClose}
              className="hover:cursor-pointer"
            />
          </div>
        )
      }
    >
      <form onSubmit={onSubmit}>
        {fields.map((field) => (
          <div key={field.name} style={{ marginBottom: "16px" }}>
            {field.type === "select" && (
              <CustomSelect
                name={field.name}
                value={data[field.name]}
                onChange={(e) => {
                  let event = {
                    target: { name: field.name, value: e.target.value },
                  };
                  onChange(event as any);
                }}
                options={field.options as Option[]}
                label={field.label}
                disabled={field.disabled}
              />
            )}
            {field.type === "multiselect" && (
              <CustomMultiSelect
                value={selectedTags}
                onChange={(value: any) => setSelectedTags(value)}
                options={field.options as Option[]}
                label={field.label}
              />
            )}
            {field.type === "autocomplete" && (
              <CustomAutocomplete
                label={field.label}
                suggestions={field.suggestions || []}
                fetchFunc={field.fetchFunc || (() => { })}
                onSelect={field.onSelect || (() => { })}
              />
            )}
            {field.type === "date" && (
              <CustomDateInput
                name={field.name}
                value={data[field.name]}
                onChange={onChange}
                label={field.label}
                disabled={field.disabled}
              />
            )}
            {field.type === "textarea" && (
              <CustomTextArea
                id={field.name}
                name={field.name}
                value={data[field.name]}
                onChange={onChange}
                placeholder={`${field.label.toLowerCase()} galchi`}
                label={field.label}
                disabled={field.disabled}
              />
            )}
            {field.type === "richtext" && (
              <>
                <RichTextEditor
                  id={field.name}
                  name={field.name}
                  value={data[field.name] || ''}
                  onChange={onChange}
                  placeholder={`${field.label.toLowerCase()} galchi`}
                  label={field.label}
                  disabled={field.disabled}
                />
              </>
            )}

            {field.type === 'file' && (
              <CustomFileInput
                id="ad-image"
                name={field.name}
                onChange={onChange}
                label={field.label}
                single={field.single}
              // resetKey={fileKey}
              />
            )}
            {field.type === "text" && (
              <CustomTextInput
                id={field.name}
                name={field.name}
                value={data[field.name]}
                onChange={onChange}
                placeholder={`${field.label.toLowerCase()} galchi`}
                label={field.label}
                type={field.inputType}
                disabled={field.disabled}
              />
            )}
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p onClick={handleClose} className="hover:cursor-pointer">
            Close
          </p>
          <button
            type="submit"
            className={`text-black border-none rounded-full py-2 px-4`}
          >
            {/* {data.id ? "Jijjiiri" : "Galchi"} */}
            Save
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default FormDialog;
