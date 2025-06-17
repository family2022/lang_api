"use client";

import { useSidebarStore } from "./store";
import { SIDEBAR_MODE } from "./store";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";

interface Props {
  size: 10 | 20 | 30 | 40 | 50;
  color: string;
}

export const SidebarController = (
  props: Props = {
    size: 20,
    color: "white",
  }
) => {
  const sidebarMode = useSidebarStore((state) => state.mode);
  const updateSidebarMode = useSidebarStore((state) => state.updateSidebarMode);
  return (
    <>
      <div className="px-2 hover:cursor-pointer">
        {sidebarMode == SIDEBAR_MODE.FULL ? (
          <FaAnglesLeft
            style={{ fontSize: `${props.size}px`, color: `${props.color}` }}
            onClick={() => {
              updateSidebarMode(SIDEBAR_MODE.ICON_ONLY);
            }}
          />
        ) : (
          <FaAnglesRight
            style={{ fontSize: `${props.size}px`, color: `${props.color}` }}
            onClick={() => {
              updateSidebarMode(SIDEBAR_MODE.FULL);
            }}
          />
        )}
      </div>
    </>
  );
};
