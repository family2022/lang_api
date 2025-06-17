const Popup = ({ message, type }: { message: string, type: 'success' | 'error' | string }) => {
  const getPopupStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-main-white';
      case 'error':
        return 'bg-main-red text-main-white';
      default:
        return 'bg-blue-500 text-main-white';
    }
  };
  return (
    <div
      className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 rounded shadow-md transition-opacity z-50 ${getPopupStyle()}`}
    >
      {message}
    </div>
  );
};

export default Popup;
