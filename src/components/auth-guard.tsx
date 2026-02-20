'use client';

import { useUser } from '@/firebase/auth/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const publicPaths = ['/login', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isPublicPath = publicPaths.includes(pathname);
      
      if (!user && !isPublicPath) {
        router.push('/login');
      }
      
      if (user && isPublicPath) {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Prevent rendering children on public pages while user is defined to avoid flashes of content
  if (user && publicPaths.includes(pathname)) {
     return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Only show children if user exists or if it's a public path
  if(user || publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  return null;
}
