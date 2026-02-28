import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Chat Platform</h1>
        <p className="text-text-muted mb-8">Distributed real-time messaging</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary rounded-lg hover:bg-primary-dark transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-surface-light rounded-lg hover:bg-surface-lighter transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
