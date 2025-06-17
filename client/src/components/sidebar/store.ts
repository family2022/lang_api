import { create } from "zustand";

export enum SIDEBAR_MODE {
  FULL = "FULL",
  ICON_ONLY = "ICON_ONLY",
  HIDDEN = "HIDDEN",
}

type State = {
  mode: SIDEBAR_MODE;
  sidebarSearch: string;
};

type Action = {
  updateSidebarMode: (mode: State["mode"]) => void;
  updateSidebarSearch: (sidebarSearch: State["sidebarSearch"]) => void;
};

export const useSidebarStore = create<State & Action>((set) => ({
  mode: SIDEBAR_MODE.FULL,
  sidebarSearch: "",
  updateSidebarSearch: (sidebarSearch: string) =>
    set(() => ({ sidebarSearch: sidebarSearch })),
  updateSidebarMode: (mode: SIDEBAR_MODE) => set(() => ({ mode: mode })),
}));
