import { 
  GoogleAuthProvider, 
  signInWithCredential,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from './firebaseConfig';
import { useState } from 'react';

// Google Web Client ID (Required for Firebase) - This remains the Web Client ID even for native builds
const GOOGLE_WEB_CLIENT_ID = '830045302104-s66btr2rgh4g7ftnfahs3dpn0760buru.apps.googleusercontent.com';

// Initialize Google Sign-In SDK globally
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

/**
 * Hook to handle Google Sign-In using the native SDK.
 * This provides a smooth, Flutter-like experience with a native account picker.
 */
export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      
      if (!idToken) {
        throw new Error('Native Sign-In failed: No ID Token retrieved.');
      }

      return idToken;
    } catch (error: any) {
      console.error('Native Google Sign-In Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleSignIn,
    isLoading,
  };
}


