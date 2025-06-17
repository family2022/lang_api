import { h } from 'preact';
import { useTranslation } from 'preact-i18next';
import { useEffect } from 'preact/hooks';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import AOS from 'aos';

const About = () => {
  const { t } = useTranslation();
  useEffect(() => {
    AOS.init({ duration: 2000 });
  }, []);

  return (
    <section class="py-16 bg-gray-100">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-12 text-center">{t('aboutTitle')}</h2>
        <div class="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 justify-evenly">
          {/* Mission Card */}
          <div class="flex-1 bg-white rounded-lg shadow-lg p-8 max-w-md" data-aos="fade-down">
            <div class="flex items-center mb-4">
              {/* Mission Icon */}
              <svg
                class="w-12 h-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {/* SVG Path */}
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m4 0h-1v4h-1m-4 0h-1v-4H9m6 4v2m0-6v2m-4 0v2m0-6v2m-4 0v2m0-6v2"
                />
              </svg>
              <h3 class="text-2xl font-semibold ml-4">{t('missionTitle')}</h3>
            </div>
            <p class="text-gray-700 leading-relaxed">{t('missionText')}</p>
          </div>
          {/* Vision Card */}
          <div class="flex-1 bg-white rounded-lg shadow-lg p-8 max-w-md" data-aos="fade-up">
            <div class="flex items-center mb-4">
              {/* Vision Icon */}
              <svg
                class="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {/* SVG Path */}
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c1.5 0 2.9.8 3.6 2.1l1.4-1.4C16.2 7.4 14.2 6 12 6s-4.2 1.4-5 3.7l1.4 1.4C9.1 8.8 10.5 8 12 8z"
                />
              </svg>
              <h3 class="text-2xl font-semibold ml-4">{t('visionTitle')}</h3>
            </div>
            <p class="text-gray-700 leading-relaxed">{t('visionText')}</p>
          </div>
        </div>
        {/* Enhanced Contact Information */}
        <div class="mt-12 bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto" data-aos="fade-down">
          <h3 class="text-3xl font-bold mb-6 text-center">{t('contactInfo')}</h3>
          <div class="flex flex-col space-y-6">
            {/* Address */}
            <div class="flex items-start">
              <FaMapMarkerAlt class="w-8 h-8 mt-1" aria-hidden="true" />
              <div class="ml-4">
                <h4 class="text-xl font-semibold">{t('addressTitle')}</h4>
                <p class="text-gray-700 leading-relaxed">
                  {t('addressDetails')}
                  <br />
                  <a
                    href="https://maps.app.goo.gl/JdRg1SkTqMybBpEq7"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-500 hover:underline"
                  >
                    {t('viewOnMap')}
                  </a>
                </p>
              </div>
            </div>
            {/* Phone */}
            <div class="flex items-start">
              <FaPhoneAlt class="w-8 h-8 mt-1" aria-hidden="true" />
              <div class="ml-4">
                <h4 class="text-xl font-semibold">{t('phoneTitle')}</h4>
                <p class="text-gray-700 leading-relaxed">
                  <a href="tel:+1234567890" class="hover:underline">
                    {t('phoneDetails')}
                  </a>
                </p>
              </div>
            </div>
            {/* Email */}
            <div class="flex items-start">
              <FaEnvelope class="w-8 h-8  mt-1" aria-hidden="true" />
              <div class="ml-4">
                <h4 class="text-xl font-semibold">{t('emailTitle')}</h4>
                <p class="text-gray-700 leading-relaxed">
                  <a href="mailto:contact@shegercity.gov" class="hover:underline">
                    {t('emailDetails')}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
