"use client"; // Ensure this component is client-side

import { IoArrowBackCircle } from "react-icons/io5";

interface Props {
  color: string;
}

export const NavbarBack = (props: Props = {
  color: "primary",
}) => {

  const handleBackClick = () => {
    console.log("handleBackClick");
    window.history.back()
  };

  return (
    <>
      <IoArrowBackCircle
        className={`text-${props.color} text-2xl cursor-pointer`}
        onClick={handleBackClick}
      />
    </>
  );
};
