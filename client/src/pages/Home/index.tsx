import { h } from 'preact';
import { Suspense } from 'preact/compat';
import { I18nextProvider } from 'preact-i18next';
import i18n from '../../i18n';
import LanguageSelector from '../../components/LanguageSelector';
import Hero from './Hero';
import Background from './Background';
import About from './About';
import Announcements from './Announcement';
import Footer from './Footer';
import Map from './Map'
import 'aos/dist/aos.css';

export function Home() {
	return (
		<I18nextProvider i18n={i18n}>
			<Suspense fallback={<div>Loading...</div>}>
				<div class="font-sans antialiased text-gray-900">
					<LanguageSelector />
					<Hero />
					<Announcements />
					<Background />
					<About />
					<Map />
					<Footer />
				</div>
			</Suspense>
		</I18nextProvider>
	);
};

