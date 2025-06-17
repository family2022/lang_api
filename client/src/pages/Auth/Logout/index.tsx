export default function Logout() {
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/auth/login'
  }

  return (
    <div class="flex justify-center items-center h-screen w-full fixed top-0 left-0 bg-main-white">
      <div>
        <p class="text-2xl font-bold">Are you sure you want to logout?</p>
        <div class="flex w-full justify-between mt-6">
          <button class="py-2 px-8 rounded-lg bg-main-red text-main-white text-lg" onClick={handleLogout}>
            Yes
          </button>
          <button class="py-2 px-8 rounded-lg text-main-black border border-main-black text-lg" onClick={() => window.history.back()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}