import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { AdmissionScheduleEvent } from '@/types/database';

export function useAdmissionSchedule() {
  const [events, setEvents] = useState<AdmissionScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('admission_schedule')
      .select('*')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  return { events, loading };
}
