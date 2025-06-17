import { h } from 'preact';
import { useTranslation } from 'preact-i18next';

const Map = () => {
  const { t } = useTranslation();

  return (
    // Section container with padding and background color
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        {/* Localized section title */}
        <h2 class="text-4xl font-bold mb-8 text-center">
          {t('mapTitle')}
        </h2>
        {/* Responsive map container */}
        <div class="relative w-full h-0 pb-[56.25%]">
          {/* Google Maps iframe with localized title */}
          <iframe
            title={t('mapIframeTitle')}
            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d6639.811214335448!2d38.639707265855115!3d8.916622797057443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1ssheger%20city!5e1!3m2!1sen!2set!4v1730545370301!5m2!1sen!2set"
            style="border:0;"
            allowFullScreen={true}
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            class="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Map;
