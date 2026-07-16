export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6" style={{ color: 'var(--color-auth-text)' }}>
        Create your weddingWire account
      </h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-auth-text)' }}>
            Full Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-auth-input-bg)',
              borderColor: 'var(--color-auth-input-border)',
            }}
            placeholder="John & Jane"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-auth-text)' }}>
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-auth-input-bg)',
              borderColor: 'var(--color-auth-input-border)',
            }}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-auth-text)' }}>
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-auth-input-bg)',
              borderColor: 'var(--color-auth-input-border)',
            }}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-auth-accent)',
            color: 'var(--color-bg-primary)',
          }}
        >
          Create Account
        </button>
      </form>
      <p className="mt-4 text-center text-sm" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Already have an account?{' '}
        <a href="/login" className="font-medium" style={{ color: 'var(--color-auth-accent)' }}>
          Login
        </a>
      </p>
    </div>
  );
}
