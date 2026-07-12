'use client';

import { useUser } from '@/firebase/auth/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Mail, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendEmailVerification } from 'firebase/auth';

const publicPaths = ['/login', '/signup', '/privacy', '/terms'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, loading, reloadUser, logout } = useUser();
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
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- EMAIL ACTIVATION GATE ---
  // Everyone except the master admin must verify their email to see data
  const isSystemAdmin = firebaseUser?.email?.toLowerCase() === 'berto.admin@bodaempire.com';
  
  if (firebaseUser && !firebaseUser.emailVerified && !isSystemAdmin && !publicPaths.includes(pathname)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center bg-accent text-white overflow-hidden">
        <div className="absolute top-[-10%] -left-20 w-[400px] h-[400px] border-[20px] border-primary/10 rounded-full" />
        
        <div className="bg-white/10 p-6 rounded-full mb-8 backdrop-blur-sm border border-white/20">
            <Mail className="h-16 w-16 text-primary animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Activate Your Account</h2>
        <p className="text-white/70 max-w-sm mb-10 leading-relaxed font-medium">
            We've sent an activation link to:<br/>
            <span className="text-primary font-black text-lg">{firebaseUser.email}</span><br/><br/>
            Please check your inbox (and spam folder) to verify your identity.
        </p>

        <div className="flex flex-col w-full max-w-xs gap-4 relative z-10">
            <Button onClick={() => reloadUser()} className="h-14 font-black uppercase italic tracking-wider shadow-lg bg-primary text-accent hover:bg-primary/90">
                I have verified my email
            </Button>
            <Button 
                variant="outline" 
                onClick={() => sendEmailVerification(firebaseUser)} 
                className="h-12 text-xs font-bold uppercase tracking-widest border-white/20 text-white hover:bg-white/5"
            >
                Resend activation link
            </Button>
            <Button variant="ghost" onClick={() => logout()} className="text-white/40 text-xs uppercase font-bold tracking-widest hover:text-white">
                Sign Out & Start Over
            </Button>
        </div>

        <div className="mt-12 flex items-center gap-2 text-white/30 text-[0.6rem] font-bold uppercase tracking-[0.2em]">
            <ShieldAlert size={14} /> Security Protocol Active
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}