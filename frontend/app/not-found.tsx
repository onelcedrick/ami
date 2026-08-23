import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-8xl font-black text-blue-600 dark:text-blue-400 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page introuvable</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
