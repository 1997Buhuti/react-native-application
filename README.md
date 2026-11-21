# React Native Todo with Supabase Login (Google)

A Todo app built with Expo and Supabase. Users sign in with their Google account before they see the todo list.

This guide covers the login setup. For the edge function demo, see [supabase/README.md](supabase/README.md).

---

## What you will build

- A login screen with a **Continue with Google** button.
- A Google sign-in that runs in the system browser and returns to the app.
- A session that stays saved on the phone after you close the app.
- A **Sign out** button in the app header.

## How login works

1. The app asks Supabase for a Google sign-in URL (`supabase.auth.signInWithOAuth`).
2. The app opens that URL in a browser sheet (`WebBrowser.openAuthSessionAsync`).
3. Google asks the user to pick an account. Supabase then sends the browser back to the app with a one-time `code`.
4. The app swaps the `code` for a session (`supabase.auth.exchangeCodeForSession`).
5. Supabase saves the session on the device. The app shows the todo screen.

The app never sees the Google password, and it never holds the Google client secret. The secret lives only in the Supabase dashboard.

---

## Prerequisites

- A current Node.js LTS release.
- A Supabase project. The app already uses one for the todo table.
- A Google account.
- The **Expo Go** app on your phone, or an Android or iOS simulator.

## Step 1: Install and configure the environment

```bash
npm install
```

If there is no `.env` file yet, copy `.env.example` to `.env`. Then open `.env` and fill in your values from Supabase. Copy the **Project URL** from **Project Settings → API**, and the **Publishable key** from **Project Settings → API Keys**:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The publishable key is safe to ship in the app. Never put the `service_role` key or the database password in this project.

## Step 2: Create a Google OAuth client

1. Open the [Google Cloud console](https://console.cloud.google.com/) and select a project. Create one if you do not have one.
2. Open **Google Auth Platform** and complete the setup wizard:
   - **Branding**: enter an app name and a support email.
   - **Audience**: choose **External**. While the app is in *Testing*, add your own Google account under **Test users**.
   - **Data Access**: make sure these scopes are listed: `openid`, `.../auth/userinfo.email`, and `.../auth/userinfo.profile`.
3. Open **Clients → Create client**.
4. Set **Application type** to **Web application**. This one client works for Expo Go, iOS, and Android in this flow.
5. Under **Authorized redirect URIs**, add your Supabase callback URL:

   ```text
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

   You can copy the exact value from the Google provider page in Supabase (Step 3).
6. Click **Create**. Copy the **Client ID** and **Client secret**.

Do not add Android or iOS clients for this guide. They are only needed for Google's native sign-in SDK, which this project does not use.

## Step 3: Turn on Google in Supabase

1. Open your project in the Supabase dashboard.
2. Go to **Authentication → Providers → Google**.
3. Turn the provider on. Paste the **Client ID** and **Client secret** from Step 2, then save.
4. Go to **Authentication → URL Configuration**.
5. Under **Redirect URLs**, add these two entries and save:

   ```text
   exp://**
   reactnativeapplication://**
   ```

   - `exp://**` lets Expo Go return to the app. It covers the changing LAN address that Expo Go uses.
   - `reactnativeapplication://**` lets a built app return to the app. The value comes from `"scheme"` in `app.json`.

   Remove `exp://**` before you publish a production app. Use the exact URLs instead.

## Step 4: Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go. Watch the terminal for a line like this:

```text
[auth] redirect URL: exp://192.168.1.20:8081/--/auth/callback
```

This is the URL the app sends to Supabase. It must match one of the Redirect URLs from Step 3. The `exp://**` entry covers it.

Tap **Continue with Google**, pick your test account, and approve the access. The app should show your email and your todo list.

## Step 5: Check that it works

- Your email appears in the header.
- Add a todo, then check it off.
- Tap **Sign out**. The login screen appears.
- Sign in again. Close the app completely, then reopen it. You should still be signed in until you sign out.

---

## Code tour

| File | Purpose |
| --- | --- |
| `src/lib/supabase/client.ts` | Creates the one Supabase client. Sets PKCE and saves the session with AsyncStorage. |
| `src/features/auth/repository.ts` | Runs the Google login flow and sign-out. The only file that calls `supabase.auth` for sign-in. |
| `src/features/auth/useAuth.ts` | Keeps the current session in React state and exposes login and logout actions. |
| `components/LoginScreen.tsx` | The signed-out screen with the Google button. |
| `App.tsx` | Shows the login screen or the todo screen, depending on the session. |
| `app.json` | Sets the URL `scheme` that the redirect needs. |

The todo code (`src/features/todos/`) did not change.

## Troubleshooting

| Message or symptom | Cause and fix |
| --- | --- |
| `Error 400: redirect_uri_mismatch` (Google page) | The Authorized redirect URI in Google does not match the Supabase callback URL. Copy it again from Supabase's Google provider page. |
| `Access blocked` or "has not completed the verification" | The Google app is in Testing. Add your Google account under **Audience → Test users**. |
| Browser returns to the login screen with an error about the redirect | The redirect URL is not in the Supabase allowlist. Copy the `[auth] redirect URL` line from the terminal into **URL Configuration → Redirect URLs**. |
| `Login finished without an auth code` | The browser returned to the app without a `code`. Check the Redirect URLs list, then try again. |
| Nothing happens after you cancel the browser | This is expected. Cancelling is not an error, so the login screen stays. |
| `Missing EXPO_PUBLIC_SUPABASE_URL...` | `.env` is missing or incomplete. Fix it, then restart with `npx expo start -c`. |
| Login worked before, now fails after switching Wi-Fi | Expo Go uses your computer's LAN address. Check the new `[auth] redirect URL` line. The `exp://**` entry should still match. |

## Security notes

- Row-level security (RLS) is what protects data in Supabase. Keep it turned on for every table.
- The publishable key and the URL are public by design. They identify the project; they do not grant access to private rows.
- The Google client secret belongs only in the Supabase dashboard.

## Current limitations

- **All signed-in users share one todo list.** The `todos` table has no `user_id` column, so every user reads and writes the same rows. To give each user their own todos, add a `user_id` column that defaults to `auth.uid()`, then write RLS policies that compare it to `auth.uid()`. This project does not do that yet.
- Only native (Expo Go, iOS, Android) login is covered. Web login needs HTTPS and a different redirect setup.
- Google's native sign-in SDK is not used. The browser flow is simpler and works in Expo Go.
