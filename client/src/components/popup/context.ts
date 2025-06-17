import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

interface PopupContextType {
  showPopup: (message: string, type: 'success' | 'error' | string) => void;
}

export const PopupContext = createContext<PopupContextType | undefined>(
  undefined
);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};
