import { useState } from 'preact/hooks';
import { useAuthStore } from '../../../store/auth.store';
import { usePopup } from '../../../components/popup/context';
import { jwtDecode } from 'jwt-decode';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showPopup } = usePopup()

  // Retrieve token from the URL query parameters
  const token = new URLSearchParams(window.location.search).get('token');
  const resetPassword = useAuthStore((state) => state.resetPassword);
  try {
    jwtDecode(token)
  } catch (error) {
    window.location.href = '/auth/login';
  }
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!token) {
      showPopup('Invalid or missing token.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showPopup('Passwords do not match.', 'error');
      return;
    }

    try {
      await resetPassword(token, newPassword);
      showPopup('Password reset successfully.', 'success');
      window.location.href = '/auth/login';
    } catch (err) {
      showPopup(err.message, 'error')
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-white">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-semibold text-gray-700 mb-6">Update your password</h2>
        <form onSubmit={handleSubmit}>
          <div class="mb-4">
            <label class="block text-gray-600 mb-2">New Password:</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg outline-none focus:outline-none focus:border-main-orange bg-main-white"
              value={newPassword}
              onInput={(e) => setNewPassword((e.target as HTMLInputElement).value)}
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-600 mb-2">Confirm Password:</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg outline-none focus:outline-none focus:border-main-orange bg-main-white"
              value={confirmPassword}
              onInput={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-main-orange text-main-white py-2 px-4 rounded-lg font-bold"
          >
            Reset
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
