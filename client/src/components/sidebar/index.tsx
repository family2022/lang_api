"use client";

import { useEffect, useState } from "react";
import { useSidebarStore, SIDEBAR_MODE } from "./store";
import { SidebarLogo } from "./logo.sidebar";
import { SidebarClose } from "./close.sidebar";
import { SidebarOpen } from "./open.sidebar";
import SidebarButtons from "./buttons.sidebar";
import ShegerLogo from '../../assets/images/Sheger_City.png';
import { FaUsers, FaHouseChimneyUser, FaUserTie } from "react-icons/fa6";
import { GiUndergroundCave } from "react-icons/gi";
import { RiCalendarScheduleFill, RiLogoutCircleLine } from "react-icons/ri";
import { VscFeedback } from "react-icons/vsc";
import { TfiAnnouncement } from "react-icons/tfi";
import { TbFileReport } from "react-icons/tb";
import { getDecodedToken } from "../../utils/authUtils";

interface Props {
  bgColor: string;
}

export const Sidebar = (props: Props) => {
  const sidebarMode = useSidebarStore((state) => state.mode);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const decodedToken = getDecodedToken(); // Get user role from token
    if (decodedToken) {
      setUserRole(decodedToken.role);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const newMode = screenWidth < 639 ? SIDEBAR_MODE.HIDDEN : SIDEBAR_MODE.FULL;
      useSidebarStore.setState({ mode: newMode });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const sidebarButtons = [
    { path: "/users", icon: FaUsers, text: "Users", roles: ['DATABASE_ADMIN', 'HEAD'] },
    { path: "/employee", icon: FaHouseChimneyUser, text: "Employee", roles: ['HR', 'HEAD'] },
    { path: "/land", icon: GiUndergroundCave, text: "Land", roles: ['SYSTEM_ADMIN', 'LAND_BANK', 'HEAD', 'OFFICER'] },
    { path: "/owner", icon: FaUserTie, text: "Land Owner", roles: ['SYSTEM_ADMIN', 'HEAD', 'OFFICER'] },
    { path: "/announcement", icon: TfiAnnouncement, text: "Announcement", roles: ['HEAD', 'OFFICER', 'SYSTEM_ADMIN'] },
    { path: "/appointment", icon: RiCalendarScheduleFill, text: "Appointment", roles: ['RECEPTION', 'SYSTEM_ADMIN', 'HEAD', 'OFFICER'] },
    { path: "/feedback", icon: VscFeedback, text: "Feedback", roles: ['HEAD'] },
    { path: "/user-report", icon: TbFileReport, text: "Report", roles: ['DATABASE_ADMIN', 'SYSTEM_ADMIN', 'RECEPTION', 'LAND_BANK', 'OFFICER', 'HR', 'FINANCE', 'OTHER', 'HEAD'] },
    { path: "/logout", icon: RiLogoutCircleLine, text: "Logout", roles: ['DATABASE_ADMIN', 'SYSTEM_ADMIN', 'RECEPTION', 'LAND_BANK', 'OFFICER', 'HR', 'FINANCE', 'OTHER', 'HEAD'] },
  ];

  const filteredButtons = sidebarButtons.filter(
    (button) => button.roles?.includes(userRole) || !button.roles
  );

  return (
    <>
      {sidebarMode !== SIDEBAR_MODE.HIDDEN && (
        <nav
          className={`overflow-y-auto p-2 flex flex-col justify-between h-screen flex-shrink-0 ${sidebarMode === SIDEBAR_MODE.ICON_ONLY
            ? ""
            : "max-sm:w-full w-[250px]"
            } bg-${props.bgColor}`}
        >
          <div>
            <SidebarLogo
              logoUrl={ShegerLogo}
              align="end"
              width={70}
              height={100}
            />
            <div className="bg-light-gray h-[2px] w-full opacity-30 my-2"></div>
            <SidebarButtons buttons={filteredButtons} buttonColorPrimary="primary" buttonColorSecondary="selected-primary" />
          </div>
          <SidebarClose />
        </nav>
      )}
      {sidebarMode === SIDEBAR_MODE.HIDDEN && <SidebarOpen />}
    </>
  );
};
