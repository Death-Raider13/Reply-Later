# 🔥 Firestore Setup Guide

Your ReplyLater app is stuck on loading because Firestore needs to be properly configured. Follow these steps:

## 1. 🚀 Set up Firestore Database

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `tasbroroyal-67653`
3. **Navigate to Firestore Database**:
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"

## 2. 📋 Choose Database Mode

**Select "Start in test mode"** for now (we'll secure it later):
- This allows read/write access for 30 days
- Perfect for development and testing

## 3. 🌍 Choose Location

Select a location close to your users (e.g., `us-central1` or `europe-west1`)

## 4. ✅ Database Created!

Once created, you should see an empty Firestore database.

## 5. 🔒 Security Rules (Important!)

After testing, update your security rules:

1. Go to **Firestore Database > Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own reminders
    match /reminders/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User preferences
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## 6. 🔄 Refresh Your App

After setting up Firestore, refresh your ReplyLater app. It should now load properly!

## 🆘 Still Having Issues?

If you're still seeing the loading screen:

1. **Check Browser Console**: Press F12 and look for error messages
2. **Verify Environment Variables**: Make sure your `.env.local` file has the correct Firebase config
3. **Check Network Tab**: Look for failed requests to Firebase

## 🎯 Quick Test

Once Firestore is set up, try:
1. **Adding a reminder** - Click "Add Reminder"
2. **Check Firestore Console** - You should see the data appear in your database

---

**Need help?** Check the browser console for specific error messages!
