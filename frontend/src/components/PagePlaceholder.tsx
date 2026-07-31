import { motion } from 'framer-motion';

interface PagePlaceholderProps {
  title: string;
  description: string;
}

/** Placeholder padrão das páginas da fundação. */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-800 bg-surface-925/50 px-8 py-20 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl text-accent-400">
        ♠
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </motion.div>
  );
}
