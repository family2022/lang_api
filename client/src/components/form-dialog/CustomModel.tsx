import React, { ReactNode } from "react";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title: string | ReactNode;
  children: ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  title,
  children,
}) => {
  return (
    <div
      className={`${open ? "flex" : "hidden"
        } fixed inset-0 bg-black bg-opacity-50 z-50 justify-center items-center overflow-ellipsis`}
    >
      <div
        className="bg-white p-5 rounded-lg shadow-lg sm:w-[500px] w-full max-h-[calc(100vh_-_4rem)] overflow-y-auto"
      >
        <div className="text-2xl mb-2">{title}</div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
