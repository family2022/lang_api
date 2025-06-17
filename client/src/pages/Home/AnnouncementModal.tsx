import { h } from 'preact';
import { useEffect } from 'preact/hooks';

const AnnouncementModal = ({ announcement, onClose }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg max-w-xl w-full mx-4 p-6 relative overflow-y-auto max-h-96">
        <button
          onClick={onClose}
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-3xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 class="text-3xl font-bold mb-4">{announcement.title}</h2>
        <p class="text-sm text-gray-500 mb-4">
          {new Date(announcement.createdAt).toLocaleDateString()}
        </p>
        <div class="mt-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{
          __html: announcement.description
        }}>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
