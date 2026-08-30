import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

/** Null profile + `needsOnboarding: true` means the student is authenticated
 *  but hasn't passed the age-gate onboarding yet (no profiles row exists). */
export function useProfile() {
  const { session, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    setProfile(data ?? null);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (!sessionLoading) refresh();
  }, [sessionLoading, refresh]);

  return {
    session,
    profile,
    loading: sessionLoading || loading,
    needsOnboarding: !sessionLoading && !!session && !loading && !profile,
    refresh,
  };
}
