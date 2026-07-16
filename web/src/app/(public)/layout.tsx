export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-auth-bg)' }}>
      {children}
    </div>
  );
}
