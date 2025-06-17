"use client";
import { useSidebarStore } from "./store";
import { SIDEBAR_MODE } from "./store";
import { IoClose } from "react-icons/io5";

export const SidebarClose = () => {
  const sidebarMode = useSidebarStore((state) => state.mode);
  const updateSidebarMode = useSidebarStore((state) => state.updateSidebarMode);

  return (
    <>
      <button
        onClick={() => updateSidebarMode(SIDEBAR_MODE.HIDDEN)}
        className="flex w-full items-center justify-center py-2 rounded-lg mt-3 bg-primary"
      >
        <IoClose
          className={`text-white text-2xl ${sidebarMode === "FULL" && "mr-2"}`}
        />
        {sidebarMode === SIDEBAR_MODE.FULL && (
          <p className="flex justify-start text-white">
            Close
          </p>
        )}
      </button>
    </>
  );
};
