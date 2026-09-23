'use client';

import { useUser } from '@/supabase/auth/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mail, ShieldAlert } from 'lucide-react';
import { BrandShield } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/language-context';

const publicPaths = ['/login', '/signup', '/privacy', '/terms'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, supabaseUser, loading, reloadUser, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isResending, setIsResending] = useState(false);

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
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background">
        <BrandShield size={120} priority className="animate-pulse" />
        <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gold" />
        </div>
      </div>
    );
  }

  // --- EMAIL ACTIVATION GATE ---
  // Everyone except the master admin must verify their email to see data.
  // Google sign-ins arrive already verified, so this only ever blocks
  // fresh email/password signups.
  const isSystemAdmin = supabaseUser?.email?.toLowerCase() === 'berto.admin@bodaempire.com';
  const isVerified = !!supabaseUser?.email_confirmed_at;

  if (supabaseUser && !isVerified && !isSystemAdmin && !publicPaths.includes(pathname)) {
    const resend = async () => {
      setIsResending(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.resend({ type: 'signup', email: supabaseUser.email! });
        toast(error
          ? { variant: 'destructive', title: t("auth.guard.resendFailedTitle"), description: error.message }
          : { title: t("auth.guard.resendSentTitle") });
      } finally {
        setIsResending(false);
      }
    };

    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center bg-accent text-white overflow-hidden">
        <div className="absolute top-[-10%] -left-20 w-[400px] h-[400px] border-[20px] border-primary/10 rounded-full" />

        <div className="bg-white/10 p-6 rounded-full mb-8 backdrop-blur-sm border border-white/20">
            <Mail className="h-16 w-16 text-primary animate-pulse" />
        </div>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{t("auth.guard.activateTitle")}</h2>
        <p className="text-white/70 max-w-sm mb-10 leading-relaxed font-medium">
            {t("auth.guard.activateSentTo")}<br/>
            <span className="text-primary font-black text-lg">{supabaseUser.email}</span><br/><br/>
            {t("auth.guard.activateCheckInbox")}
        </p>

        <div className="flex flex-col w-full max-w-xs gap-4 relative z-10">
            <Button onClick={() => reloadUser()} className="h-14 font-black uppercase italic tracking-wider shadow-lg bg-primary text-accent hover:bg-primary/90">
                {t("auth.guard.verifiedButton")}
            </Button>
            <Button
                variant="outline"
                onClick={resend}
                disabled={isResending}
                className="h-12 text-xs font-bold uppercase tracking-widest border-white/20 text-white hover:bg-white/5"
            >
                {t("auth.guard.resendButton")}
            </Button>
            <Button variant="ghost" onClick={() => logout()} className="text-white/40 text-xs uppercase font-bold tracking-widest hover:text-white">
                {t("auth.guard.signOutButton")}
            </Button>
        </div>

        <div className="mt-12 flex items-center gap-2 text-white/30 text-[0.6rem] font-bold uppercase tracking-[0.2em]">
            <ShieldAlert size={14} /> {t("auth.guard.securityProtocol")}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
