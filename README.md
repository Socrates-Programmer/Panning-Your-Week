# Google Sign-In + Firebase Setup Guide

## Overview
Your Planning Your Week app now has Google Sign-In authentication integrated with Firebase Firestore. Users can:
- Sign in with their Google account
- Have their schedules stored securely in the cloud
- Access their data from any device

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a project** (or use an existing one)
3. Enter project name: `planning-your-week` (or your choice)
4. Accept Firebase terms and click **Create project**
5. Wait for the project to be created (~1 minute)

## Step 2: Enable Google Sign-In

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get Started**
3. Click on **Google** provider
4. Toggle **Enable** ON
5. Select a project support email and click **Save**

## Step 3: Create a Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose **Production mode** for security
4. Select region: **us-central1** (or closest to you)
5. Click **Create**
6. Once created, go to **Rules** tab and replace with:

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

7. Click **Publish**

## Step 4: Get Firebase Credentials

1. In Firebase Console, go to **Project settings** (gear icon, top right)
2. Select **Your apps** section → **Web app**
3. If no web app exists, click **Add app** → Select **Web** → Register
4. You'll see a code block with `firebaseConfig` object
5. Copy all values (apiKey, authDomain, projectId, etc.)

## Step 5: Update Firebase Config

1. Open `frontend/src/firebase.ts`
2. Replace the placeholder values with your copied credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",        // Copy from Firebase
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 6: Install Dependencies

```bash
cd frontend
npm install
```

## Step 7: Run the App

```bash
npm run dev
```

Open `http://localhost:3000` and you should see a login screen.

## How It Works

### Authentication Flow
1. User clicks "Inicia sesión con Google"
2. Google login popup appears
3. After successful login, user is redirected to the planner
4. User's profile info shown in top-right header with logout button

### Data Storage
- **When logged in**: Data synced to Firestore under `users/{userId}/`
- **When logged out**: Data stored in browser localStorage (for offline/demo mode)
- **Collections**:
  - `users/{userId}/types/data` — Stores hour types (Work, Free time, etc.)
  - `users/{userId}/assignments/{weekKey}` — Stores hourly assignments per week

### Data Isolation
- Each user can ONLY access their own data (enforced by Firestore rules)
- No user can see or modify another user's schedule
- Data persists across devices once logged in

## Testing

1. **Sign In**: Click Google Sign-In button
2. **Create Types**: Add custom hour types (they'll sync to Firestore)
3. **Plan Week**: Click cells to assign hours (auto-syncs)
4. **Switch Devices**: Log in from another device/browser — your data appears!
5. **Sign Out**: Click "Cerrar sesión" button
6. **Demo Mode**: While logged out, use localStorage (data saved locally only)

## Troubleshooting

### Firebase imports not found
- Run `npm install firebase` in the `frontend/` directory
- Restart your dev server: `npm run dev`

### Cannot sign in with Google
- Verify Google Sign-In is enabled in Firebase Authentication
- Check that project support email is configured
- Ensure firebaseConfig values are correct

### Data not syncing to Firestore
- Check browser console for error messages (F12 → Console tab)
- Verify Firestore Database is created and accessible
- Confirm Firestore Rules are published correctly
- Check that user is authenticated (see profile in header)

### "No rules found for Google-Cloud-Firestore" error
- This means Firestore Rules weren't published
- Go to Firestore → Rules tab → paste rules above → click Publish

## Next Steps (Optional)

- **Offline Support**: Add Service Worker for offline data syncing
- **Sharing**: Add feature to share schedule with other users
- **Teams**: Organize schedules by team or project
- **Analytics**: Track hours spent on each task type

---

**Questions?** Check the Firebase docs: https://firebase.google.com/docs
