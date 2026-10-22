# Firebase Login

A Next.js app with email/password and Google sign-in, backed by Firebase Auth and Firestore.

## Setup

1. Create a project at https://console.firebase.google.com
2. **Authentication → Sign-in method**: enable **Email/Password**, **Google** and **Anonymous**.
3. **Firestore Database**: create a database, then paste `firestore.rules` into the **Rules** tab and publish.
4. **Project settings → Your apps**: add a Web app and copy its config values.
5. Copy `.env.local.example` to `.env.local` and fill in the values.

## Run

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000

## Pages

- `/login`: sign in, Google sign-in, guest (anonymous) sign-in, and password reset
- `/register`: create an account (saves a profile to Firestore `users/{uid}`)
- `/choose-role`: pick whether to use the site as a student or a vendor (saved as `role` on the profile)
- `/dashboard`: protected page showing the profile; signed-out users are redirected to `/login`, and users without a role to `/choose-role`
