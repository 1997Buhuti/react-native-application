/**
 * Hook to invoke the dummy Supabase Edge Function ('hello-world').
 * Shows students how frontend React Native code communicates with a Deno Edge Function.
 */

import { useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export type EdgeFunctionResponse = {
  message: string;
  suggestedTask: string;
  timestamp: string;
  runtime: string;
};

export function useEdgeDemo() {
  const [data, setData] = useState<EdgeFunctionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callEdgeFunction = async (name: string = 'Students') => {
    setLoading(true);
    setError(null);

    try {
      // Calls supabase/functions/hello-world/index.ts
      const { data: result, error: fnError } = await supabase.functions.invoke<EdgeFunctionResponse>(
        'hello-world',
        {
          body: { name },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }
      if (!result) {
        throw new Error('No data received from Edge Function');
      }

      setData(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to call Edge Function';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setData(null);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    callEdgeFunction,
    clear,
  };
}
