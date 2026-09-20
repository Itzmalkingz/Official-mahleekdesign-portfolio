import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="mb-8 text-lg text-gray-600">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="px-6 py-3 bg-black text-white rounded-md">
          Go Home
        </Link>
        <Link href="/work" className="px-6 py-3 border border-black rounded-md">
          View Work
        </Link>
      </div>
    </div>
  );
}
