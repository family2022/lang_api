import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'preact-i18next';
import { useAnnouncementStore } from '../../store/announcement.store';
import AnnouncementModal from './AnnouncementModal';

const Announcements = () => {
  const { t } = useTranslation();

  // Use a selector to subscribe to announcements changes
  const fetchAnnouncements = useAnnouncementStore((state) => state.fetchAnnouncements);
  const announcements = useAnnouncementStore((state) => state.announcements);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        await fetchAnnouncements(0, 10, { status: 'PUBLISHED' }); // Adjust page and limit as needed
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnnouncements();
  }, [fetchAnnouncements]);

  const handleCardClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleModalClose = () => {
    setSelectedAnnouncement(null);
  };

  return (
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-8 text-center">
          {t('announcementsTitle')}
        </h2>
        {isLoading ? (
          <p class="text-center text-gray-500">{t('loading')}</p>
        ) : announcements && announcements.length > 0 ? (
          <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                class="bg-gray-50 p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleCardClick(announcement)}
              >
                <h3 class="text-2xl font-bold mb-2">{announcement.title}</h3>
                <p class="text-sm text-gray-500">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
                <div class="mt-4 text-gray-700" dangerouslySetInnerHTML={{
                  __html: announcement.description && announcement.description.length > 100
                    ? announcement.description.substring(0, 100) + '...'
                    : announcement.description
                }}>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p class="text-center text-gray-500">{t('noAnnouncements')}</p>
        )}

        {selectedAnnouncement && (
          <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={handleModalClose}
          />
        )}
      </div>
    </section>
  );
};

export default Announcements;
