import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

/** Layout principal: Sidebar + Navbar + conteúdo. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar />
      <div className="pl-64">
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
