import { Suspense } from 'react';

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>}>
      {children}
    </Suspense>
  );
}