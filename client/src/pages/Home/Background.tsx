
import { h } from 'preact';
import { useTranslation } from 'preact-i18next';
import AOS from 'aos';
import { useEffect } from 'preact/hooks';

const timelineData = [
  {
    dateKey: 'timelineDate1',
    titleKey: 'timelineTitle1',
    textKey: 'timelineText1',
    imageSrc: '/assets/timeline1.jpg',
    imageAltKey: 'timelineImageAlt1',
  },
  {
    dateKey: 'timelineDate2',
    titleKey: 'timelineTitle2',
    textKey: 'timelineText2',
    imageSrc: '/assets/timeline2.jpg',
    imageAltKey: 'timelineImageAlt2',
  },
  // Add more timeline items as needed
];

const Background = () => {
  const { t } = useTranslation();
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-12 text-center">{t('backgroundTitle')}</h2>
        {/* Timeline Section */}
        <div class="relative">
          <div class="hidden md:block border-l-4 border-primary absolute h-full left-1/2 transform -translate-x-1/2"></div>
          <div class="space-y-12">
            {timelineData.map((item, index) => (
              <div
                data-aos="fade-up"
                class={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'
                  }`}
                key={index}
              >
                <div class="md:w-1/2 md:px-8">
                  <h3 class="text-xl font-semibold mb-2">
                    {t(item.dateKey)} - {t(item.titleKey)}
                  </h3>
                  <p class="text-gray-700 leading-relaxed">{t(item.textKey)}</p>
                </div>
                <div class="md:w-1/2 md:px-8 mt-8 md:mt-0">
                  <img
                    src={item.imageSrc}
                    alt={t(item.imageAltKey)}
                    class="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Background;
