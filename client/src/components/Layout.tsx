export default function Layout({ children, title }) {
  return (
    <div class="flex flex-col" style={{ height: 'calc(100vh - 32px)' }}>
      <header>
        <h1 class="w-full bg-main-orange text-main-white p-4 text-2xl font-bold">{title}</h1>
      </header>
      {/* Set main to fill the remaining space and enable scrolling within it if needed */}
      <main class="flex-grow overflow-y-auto py-2">
        {children}
      </main>
    </div>
  );
}
