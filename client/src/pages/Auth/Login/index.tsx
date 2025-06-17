import { FormEvent } from 'react';
import { useEffect, useState } from 'preact/hooks';
import { useAuthStore } from '../../../store/auth.store';
import { usePopup } from '../../../components/popup/context';
import { baseUserRoute, getDecodedToken } from '../../../utils/authUtils';
import ShegerLogo from '../../../assets/images/Sheger_City.png';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const { showPopup } = usePopup();

  const redirectBasedOnRole = () => {
    const decodedToken = getDecodedToken();
    if (!decodedToken) return;

    const userRole = decodedToken.role;

    switch (userRole) {
      case 'DATABASE_ADMIN':
        window.location.href = '/users';
        break;
      case 'SYSTEM_ADMIN':
        window.location.href = '/land';
        break;
      case 'LAND_BANK':
        window.location.href = '/land';
        break;
      case 'RECEPTION':
        window.location.href = '/appointment';
        break;
      case 'HEAD':
        window.location.href = '/users';
        break;
      case 'HR':
        window.location.href = '/employee';
        break;
      case 'FINANCE':
        window.location.href = '/user-report';
        break;
      case 'OFFICER':
        window.location.href = '/land';
        break;
      case 'OTHER':
        window.location.href = '/user-report';
        break;
      default:
        window.location.href = '/';
    }
  };

  useEffect(() => {
    if (getDecodedToken()) {
      redirectBasedOnRole();
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(identifier, password);
      redirectBasedOnRole();
    } catch (error) {
      showPopup(error.message, 'error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-main-white to-main-black">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-lg shadow-xl w-full max-w-md border border-white border-opacity-30">
        <div className="flex items-center justify-center flex-col relative mb-6">
          <div className="bg-main-white p-4 rounded-full shadow-md">
            <a href="/"><img src={ShegerLogo} alt="logo" width={150} /></a>
          </div>
          <h2 className="text-xl font-bold text-center mt-6 text-main-black">
            Login in to your account
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-main-black text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              id="email"
              value={identifier}
              onChange={(e: any) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-main-orange focus:border-transparent bg-gray-50 bg-opacity-70"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-main-black text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-main-orange focus:border-transparent bg-gray-50 bg-opacity-70"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="mb-6 text-right">
            <a href="/auth/reset/request" className="text-main-red hover:underline">
              reset password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-main-orange text-main-white py-3 px-4 rounded-lg font-semibold hover:bg-main-red transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
