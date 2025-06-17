import { h } from 'preact';
import { useTranslation } from 'preact-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div class="fixed top-4 right-4 z-50 bg-white bg-opacity-75 p-2 rounded shadow-md">
      <label class="text-gray-800 mr-2 font-semibold">{t('language')}:</label>
      <select
        onChange={changeLanguage}
        value={i18n.language}
        class="bg-white bg-opacity-75 text-gray-800 p-2 rounded border border-gray-300"
      >
        <option value="om">Afaan Oromoo</option>
        <option value="en">English</option>
        <option value="am">አማርኛ</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
