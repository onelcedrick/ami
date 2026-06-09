import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Bienvenue sur AM Info</h1>
          <p className="text-xl mb-8 text-blue-100">
            Votre plateforme e-commerce avec Intelligence Artificielle
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products" className="btn bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 text-lg">
              Voir le Catalogue
            </Link>
            <Link href="/register" className="btn border-2 border-white hover:bg-white/10 px-8 py-3 text-lg">
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center p-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Ultra Rapide</h3>
              <p className="text-gray-600">
                Backend en Go pour des performances exceptionnelles
              </p>
            </div>
            <div className="card text-center p-8">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3">IA Intégrée</h3>
              <p className="text-gray-600">
                Recommandations personnalisées et chatbot intelligent
              </p>
            </div>
            <div className="card text-center p-8">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Sécurisé</h3>
              <p className="text-gray-600">
                Authentification JWT RS256 et mots de passe Argon2id
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Microservices */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Architecture Microservices</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Gateway', 'Auth', 'Products', 'Cart', 'Orders', 'Tickets'].map(s => (
              <div key={s} className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl mb-2">
                  {s === 'Gateway' ? '🚪' : s === 'Auth' ? '🔐' : s === 'Products' ? '📦' : s === 'Cart' ? '🛒' : s === 'Orders' ? '📋' : '🎫'}
                </div>
                <div className="font-semibold text-sm">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
