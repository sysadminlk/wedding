export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold font-heading text-espresso mb-4">
        weddingWire
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Wedding Planning SaaS
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="px-6 py-3 bg-gold text-espresso rounded-lg font-medium hover:bg-gold-light transition-colors"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-6 py-3 border border-gold text-gold rounded-lg font-medium hover:bg-gold/10 transition-colors"
        >
          Register
        </a>
      </div>
    </main>
  );
}
