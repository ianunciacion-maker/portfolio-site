import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <p className="mt-4 text-lg text-text-secondary">Page not found</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full gradient-accent px-6 py-2.5 text-sm font-medium text-white"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
