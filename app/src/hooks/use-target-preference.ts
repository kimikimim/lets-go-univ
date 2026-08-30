import { useEffect, useState } from 'react';

import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import type { TargetPreference } from '@/types/database';

export function useTargetPreference() {
  const { profile } = useProfile();
  const [preference, setPreference] = useState<TargetPreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    supabase
      .from('target_preferences')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setPreference(data ?? null);
        setLoading(false);
      });
  }, [profile]);

  return { preference, loading };
}
