import { create } from "zustand";

type State = {
  navbarSearch: string;
};

type Action = {
  updateNavbarSearch: (navbarSearch: State["navbarSearch"]) => void;
};

export const useNavbarStore = create<State & Action>((set) => ({
  navbarSearch: "",
  updateNavbarSearch: (navbarSearch: string) =>
    set(() => ({ navbarSearch: navbarSearch })),
}));
