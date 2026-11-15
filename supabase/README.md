# Supabase Edge Functions Guide (For Students)

Supabase Edge Functions are server-side TypeScript functions that run on the **Deno** runtime globally at the edge (powered by Supabase / Cloudflare / Fastly).

---

## 1. Directory Structure

```text
supabase/
└── functions/
    └── hello-world/
        └── index.ts    <-- The Deno serverless edge function
```

---

## 2. How the Edge Function Works (`supabase/functions/hello-world/index.ts`)

- **Deno.serve**: Listens for HTTP requests.
- **CORS Headers**: Enables mobile apps and web apps to call the function without CORS blocks.
- **Request handling**: Reads JSON payload (`{ name }`) and returns JSON response with status codes.

---

## 3. How the React Native App Calls It (`src/features/edge-demo/useEdgeDemo.ts`)

Using the official Supabase JavaScript SDK:

```ts
import { supabase } from '../../lib/supabase/client';

const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'Students' },
});
```

---

## 4. How to Test & Deploy

### Prerequisites
Make sure the Supabase CLI is available:
```bash
npx supabase --version
```

### Option A: Test Locally with Supabase CLI
```bash
# Start local Supabase containers (if using local development)
npx supabase start

# Serve edge functions locally
npx supabase functions serve hello-world --no-verify-jwt
```

### Option B: Deploy to your Hosted Supabase Project
1. Log in to Supabase CLI:
   ```bash
   npx supabase login
   ```
2. Link your local project to your remote Supabase project:
   ```bash
   npx supabase link --project-ref your-project-id
   ```
3. Deploy the function:
   ```bash
   npx supabase functions deploy hello-world --no-verify-jwt
   ```
   *(Note: `--no-verify-jwt` allows public or client-side calls without requiring a signed Supabase user session token. If you want authentication enforced, omit that flag).*
