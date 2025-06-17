import { useState, useEffect } from "react";

const TailwindTableContainer = ({ children }: any) => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth - 400);
    };

    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="font-space-grotesk"
      style={{ width: width > 350 ? `${width}px` : '100%' }}
    >
      {children}
    </div>
  );
};

export default TailwindTableContainer;
