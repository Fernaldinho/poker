import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Library, LineChart, ListVideo, Settings, Video } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/sessions', label: 'Sessões', icon: Video },
  { to: '/library', label: 'Biblioteca', icon: Library },
  { to: '/statistics', label: 'Estatísticas', icon: LineChart },
  { to: '/replayer', label: 'Replayer', icon: ListVideo },
  { to: '/settings', label: 'Configurações', icon: Settings },
];

/** Sidebar de navegação do app. */
export function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-surface-800 bg-surface-925"
    >
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-xl text-white shadow-glow">
          ♠
        </div>
        <div>
          <h1 className="text-base font-bold text-white">Poker Analyzer</h1>
          <p className="text-xs text-slate-500">Revisão e estudo</p>
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/15 text-accent-300'
                  : 'text-slate-400 hover:bg-surface-800 hover:text-slate-200'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-800 px-6 py-4 text-xs text-slate-600">
        v0.1.0 • Fundação
      </div>
    </motion.aside>
  );
}
