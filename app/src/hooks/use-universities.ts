import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { University } from '@/types/database';

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('universities')
      .select('*')
      .order('name_kr', { ascending: true })
      .then(({ data }) => {
        setUniversities(data ?? []);
        setLoading(false);
      });
  }, []);

  return { universities, loading };
}
