import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { AdmissionTrack } from '@/types/database';

export function useAdmissionTracks() {
  const [tracks, setTracks] = useState<AdmissionTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('admission_tracks')
      .select('*')
      .then(({ data }) => {
        setTracks(data ?? []);
        setLoading(false);
      });
  }, []);

  return { tracks, loading };
}
