# ReplyLater 💬

A productivity web app that helps you remember to reply to messages with AI-powered suggestions. Never forget to respond again and strengthen your relationships!

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your Firebase credentials.

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Firebase Setup Required

To use ReplyLater, you need to:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password + Google)
   - Create a Firestore database

2. **Get Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Web app" and copy the config

3. **Update Environment Variables**
   Add your Firebase config to `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## 🌟 Features

- ⏰ Smart reminder scheduling
- 🤖 AI-powered reply suggestions  
- 🔔 Browser & email notifications
- 📱 Multi-platform support
- 🔐 Secure authentication
- 📊 Clean dashboard interface

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: OpenAI API (optional)

## 📖 Full Documentation

For complete setup instructions, deployment guides, and advanced features, see the full documentation in the project files.

---

**Happy messaging! 💙**
