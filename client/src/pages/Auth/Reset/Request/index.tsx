import { useState } from 'preact/hooks';
import { useAuthStore } from '../../../../store/auth.store';
import { usePopup } from '../../../../components/popup/context';


const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');

  const { showPopup } = usePopup()

  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    try {
      const data = await requestPasswordReset(email);
      console.log(data.message)
      showPopup(data.message, 'success')
      setEmail("")
    } catch (err) {
      showPopup(err.message, 'error')
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-white">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-semibold text-gray-700 mb-6">Reset password</h2>
        <form onSubmit={handleSubmit}>
          <div class="mb-4">
            <label class="block text-gray-600 mb-2">Email:</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg outline-none focus:outline-none focus:border-main-orange bg-main-white"
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              required
            />
          </div>
          <div class="mb-3">
            <a href="/auth/login" class='text-main-orange'>Back to login</a>
          </div>
          <button
            type="submit"
            className="w-full bg-main-orange text-main-white py-2 px-4 rounded-lg font-bold"
          >
            Request reset link
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
function showPopup(message: any, arg1: string) {
  throw new Error('Function not implemented.');
}

