import { useState } from "preact/hooks";
import { PopupContext } from './context';
import Popup from "./Popup";

export const PopupProvider = ({
  children,
}: {
  children: preact.ComponentChildren;
}) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | string>(
    'success'
  );

  const showPopup = (message: string, type: 'success' | 'error' | string) => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);

    setTimeout(() => {
      setPopupVisible(false);
    }, 6000);
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      {popupVisible && <Popup message={popupMessage} type={popupType} />}
    </PopupContext.Provider>
  );
};
