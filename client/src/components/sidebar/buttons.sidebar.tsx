import { useEffect, useCallback } from 'preact/hooks';
import { useSidebarStore } from './store';
import { SIDEBAR_MODE } from './store';
import { useLocation } from 'preact-iso';

interface Props {
  buttons: Array<{ path: string; icon: any; text: string } | 'hr'>;
  buttonColorPrimary: string;
  buttonColorSecondary: string;
}

const SidebarButtons = ({
  buttons = [],
  buttonColorPrimary = 'bg-black', // Tailwind-friendly default class
  buttonColorSecondary = 'bg-gray-700', // Tailwind-friendly default class
}: Props) => {
  const sidebarMode = useSidebarStore((state) => state.mode);
  const updateSidebarMode = useSidebarStore((state) => state.updateSidebarMode);

  const pathname = useLocation().url;

  useEffect(() => {
    if (sidebarMode === SIDEBAR_MODE.HIDDEN) {
      updateSidebarMode(SIDEBAR_MODE.HIDDEN);
    }
  }, [sidebarMode, updateSidebarMode]);

  const handleClick = useCallback(
    (path: string) => {
      if (sidebarMode === SIDEBAR_MODE.FULL) {
        window.location.href = path;
        updateSidebarMode(SIDEBAR_MODE.HIDDEN);
      }
    },
    [sidebarMode, updateSidebarMode]
  );

  return (
    <>
      {buttons.map((button, index) => {
        if (button === 'hr') {
          return (
            <div
              key={index}
              className="bg-light-gray h-[2px] w-full opacity-30 my-2 bg-main-white"
            ></div>
          );
        }

        const isActive = pathname.startsWith(button.path);

        const buttonClasses = `w-full items-center justify-center py-2 px-3 rounded-lg mt-3 ${isActive ? 'bg-main-white text-main-black' : 'bg-main-black text-main-white'}`;



        return (
          <div key={index}>
            {/* For larger screens */}
            <a
              href={button.path}
              className={`sm:flex hidden ${buttonClasses}`}
            >
              <button.icon
                className={`text-2xl hover:cursor-pointer ${sidebarMode === SIDEBAR_MODE.FULL && 'mr-2'}`}
              />
              {sidebarMode === SIDEBAR_MODE.FULL && (
                <p className="outline-none w-full placeholder-opacity-50">
                  {button.text}
                </p>
              )}
            </a>

            {/* For smaller screens */}
            <a
              href={button.path}
              className={`sm:hidden flex ${buttonClasses}`}
              onClick={() => handleClick(button.path)}
            >
              <button.icon
                className={`text-white text-2xl hover:cursor-pointer ${sidebarMode === SIDEBAR_MODE.FULL && 'mr-2'}`}
              />
              {sidebarMode === SIDEBAR_MODE.FULL && (
                <p className="outline-none w-full  placeholder-opacity-50">
                  {button.text}
                </p>
              )}
            </a>
          </div>
        );
      })}
    </>
  );
};

export default SidebarButtons;
