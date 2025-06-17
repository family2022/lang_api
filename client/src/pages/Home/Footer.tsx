import { h } from 'preact';

const Footer = () => {
  return (
    <footer class="bg-gray-800 py-6">
      <div class="container mx-auto px-4 text-center text-gray-300">
        &copy; {new Date().getFullYear()} Sheger City Land Administration. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
