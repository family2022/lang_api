"use client";
import { useSidebarStore } from "./store";
import { SIDEBAR_MODE } from "./store";
import { IoOpen } from "react-icons/io5";

export const SidebarOpen = () => {
  const sidebarMode = useSidebarStore((state) => state.mode);
  const updateSidebarMode = useSidebarStore((state) => state.updateSidebarMode);

  return (
    <>
      <IoOpen
        onClick={() => updateSidebarMode(SIDEBAR_MODE.FULL)}
        className='text-main-black text-2xl hover:cursor-pointer absolute bottom-1 left-1'
      />
    </>
  );
};
