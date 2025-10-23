'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthForm } from '@/components/auth/AuthForm';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function Home() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6">
                <span className="text-2xl">💬</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Never Forget to
                <span className="text-blue-500 block">Reply Again</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                ReplyLater helps you remember to respond to messages with AI-powered suggestions. 
                Reduce digital guilt and strengthen your relationships.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600">⏰</span>
                </div>
                <span className="text-gray-700">Smart reminder scheduling</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600">🤖</span>
                </div>
                <span className="text-gray-700">AI-powered reply suggestions</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-purple-600">🔔</span>
                </div>
                <span className="text-gray-700">Browser & email notifications</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-orange-600">📱</span>
                </div>
                <span className="text-gray-700">Multi-platform support</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10+</div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">AI</div>
                <div className="text-sm text-gray-600">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">Free</div>
                <div className="text-sm text-gray-600">To Use</div>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="flex justify-center">
            <AuthForm 
              mode={authMode} 
              onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
