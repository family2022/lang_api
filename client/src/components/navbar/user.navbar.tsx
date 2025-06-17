import { FaUserAlt } from "react-icons/fa";

export const NavbarUser = () => {
  const userData = {
    firstName: "John",
    middleName: "Yidnekachew",
    lastName: "Doe",
    email: "john.doe",
    profilePicture: undefined,
    role: "storeKeeper",
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <div>
          <p className="text-black text-sm leading-none">{`${userData.firstName} ${userData.lastName}`}</p>
          <p className="text-gray-900 text-[10px] leading-none">{userData.role.toUpperCase()}</p>
        </div>
        {userData.profilePicture ? (
          <img
            className="rounded-full"
            src={userData.profilePicture}
            width={30}
            height={20}
            alt="profile"
          />
        ) : (
          <FaUserAlt className="text-2xl" />
        )}
      </div>
    </>
  );
};
