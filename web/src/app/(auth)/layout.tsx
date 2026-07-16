export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-auth-bg)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-luxury-lg"
        style={{ backgroundColor: 'var(--color-auth-surface)' }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold gold-text">
            WeddingHub
          </h1>
          <p className="text-xs font-label uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--color-auth-text-secondary)' }}>
            Luxury Wedding Planning
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
