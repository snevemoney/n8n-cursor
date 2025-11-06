import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
      <p className="text-xl text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Link 
        href="/dashboard"
        className="mt-6 rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Return to Dashboard
      </Link>
    </div>
  );
} 