import { NavbarBack } from "./back.navbar";
import { NavbarSearch } from "./search.navbar";
import { NavbarUser } from "./user.navbar";

interface Props {
  bgColor: string;
}

export const Navbar = (
  props: Props = {
    bgColor: "white",
  }
) => {
  return (
    <>
      <nav className={`w-full bg-${props.bgColor}`}>
        <div className="w-full flex justify-between p-2">
          <div className="flex items-center">
            <NavbarBack color="primary" />
          </div>
          <div className="flex gap-6">
            <NavbarSearch />
            <NavbarUser />
          </div>
        </div>
      </nav>
    </>
  );
};
