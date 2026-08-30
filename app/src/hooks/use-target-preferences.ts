import { useEffect, useState } from 'react';

import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import type { TargetPreference } from '@/types/database';

/** All of a student's saved target university/department rows — plural,
 *  unlike use-target-preference which only returns the latest one. */
export function useTargetPreferences() {
  const { profile } = useProfile();
  const [preferences, setPreferences] = useState<TargetPreference[]>([]);
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
      .then(({ data }) => {
        setPreferences(data ?? []);
        setLoading(false);
      });
  }, [profile]);

  return { preferences, loading };
}
