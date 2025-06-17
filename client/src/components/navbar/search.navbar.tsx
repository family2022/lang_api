"use client";
import { IoIosSearch } from "react-icons/io";
import { useNavbarStore } from "./store";

interface Props { }

export const NavbarSearch = (props: Props) => {
  const navbarSearch = useNavbarStore((state) => state.navbarSearch);
  const updateNavbarSearch = useNavbarStore(
    (state) => state.updateNavbarSearch
  );
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log("search");
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="flex sm:w-[250px] w-full items-center py-1 px-3 rounded-lg bg-light-gray border border-black border-opacity-50"
      >
        <input
          type="text"
          placeholder="Quick Search"
          name="search"
          id="search"
          className="outline-none bg-light-gray text-black w-full placeholder-black placeholder-opacity-50"
          value={navbarSearch}
          onChange={(e: any) => updateNavbarSearch(e.target.value)}
        />
        <label
          className="hover:cursor-pointer"
          htmlFor="search"
          onClick={handleSearch}
        >
          <IoIosSearch className="text-black text-2xl opacity-50" />
        </label>
      </form>
    </>
  );
};
