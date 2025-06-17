"use client";
import { useSidebarStore } from "./store";
import { SIDEBAR_MODE } from "./store";
import { IoIosSearch } from "react-icons/io";
import { useRef } from "react";

interface Props {}

export const SidebarSearch = (props: Props) => {
  const sidebarMode = useSidebarStore((state) => state.mode);
  const updateSidebarMode = useSidebarStore((state) => state.updateSidebarMode);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log("search");
  };

  const handleLabelClick = () => {
    if (sidebarMode === SIDEBAR_MODE.ICON_ONLY) {
      updateSidebarMode(SIDEBAR_MODE.FULL);
    } else {
      handleSearch();
    }

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="flex w-full items-center justify-center bg-selected-primary py-2 px-3 rounded-lg"
      >
        <label
          className='hover:cursor-pointer'
          htmlFor="search"
          onClick={handleLabelClick}
        >
          <IoIosSearch
            className={`text-white text-2xl ${
              sidebarMode === SIDEBAR_MODE.FULL && "mr-2"
            }`}
          />
        </label>
        {sidebarMode === SIDEBAR_MODE.FULL && (
          <input
            type="text"
            placeholder="Quick Search"
            name="search"
            id="search"
            ref={searchInputRef}
            className="bg-selected-primary outline-none text-white w-full placeholder-white placeholder-opacity-50"
          />
        )}
      </form>
    </>
  );
};
