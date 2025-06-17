"use client";
import { SidebarController } from "./controller.sidebar";
import { useSidebarStore } from "./store";
import { SIDEBAR_MODE } from "./store";

interface Props {
  logoUrl: string;
  align: string;
  width: number;
  height: number;
}

export const SidebarLogo = (
  props: Props = {
    align: "start",
    width: 100,
    height: 0,
    logoUrl: "",
  }
) => {
  const sidebarMode = useSidebarStore((state) => state.mode);
  return (
    <>
      <div className="flex items-center justify-between">
        {sidebarMode === SIDEBAR_MODE.FULL && (
          <div className={`flex w-full justify-${props.align}`}>
            <img
              src={props.logoUrl}
              className="h-full bg-main-white rounded-full hover:cursor-pointer"
              alt="logo"
              width={props.width}
              height={props.height}
              onClick={() => window.location.href = "/"}
            />
          </div>
        )}
        <SidebarController size={30} color="white" />
      </div>
    </>
  );
};
