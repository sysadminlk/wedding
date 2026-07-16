export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-auth-bg)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl" style={{ backgroundColor: 'var(--color-auth-surface)' }}>
        {children}
      </div>
    </div>
  );
}
