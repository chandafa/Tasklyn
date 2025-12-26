'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production" && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
        console.error('Automatic initialization failed, and environment variables are missing. Falling back to hardcoded config might not be possible.');
      }
      
      // Fallback to config from .env file if available
      if (firebaseConfig.apiKey && firebaseConfig.projectId) {
          firebaseApp = initializeApp(firebaseConfig);
      } else {
          // This block will run if initialization via App Hosting fails AND .env variables are missing.
          console.error("Firebase initialization failed. Ensure your environment variables are set correctly or your App Hosting setup is complete.");
          // To prevent a hard crash, we can try to initialize with a fallback, but this is not ideal.
          // For this app, we'll throw an error if we can't initialize.
          throw new Error("Could not initialize Firebase. Please check your configuration.");
      }
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
