import { 
  GoogleAuthProvider, 
  signInWithCredential,
} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { auth } from './firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

// Google Web Client ID (from user)
const GOOGLE_WEB_CLIENT_ID = '830045302104-s66btr2rgh4g7ftnfahs3dpn0760buru.apps.googleusercontent.com';

// Google OAuth Discovery
const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// Native Client IDs
// Native Client IDs
const GOOGLE_ANDROID_CLIENT_ID = '830045302104-94le0vis0cmuve7errrd7bnbgbrc224i.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '830045302104-i9s1onjt33mrtcn5dhh8a515d2jfck9n.apps.googleusercontent.com';

/**
 * Hook to handle Google Sign-In using Authorization Code flow.
 */
export function useGoogleAuth() {
  const { signInWithGoogle } = useAuth();

  // Dynamically generate the redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'resumate',
  });

  // Log for verification
  useEffect(() => {
    console.log('🔑 Redirect URI (Ensure this is in your Google Console):', redirectUri);
  }, [redirectUri]);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      // Use Android Client ID for native Android, Web Client ID for everything else
      clientId: Platform.OS === 'android' ? GOOGLE_ANDROID_CLIENT_ID : GOOGLE_WEB_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === 'success' && result.params?.id_token) {
        const credential = GoogleAuthProvider.credential(result.params.id_token);
        return await signInWithCredential(auth, credential);
      } else if (result?.type === 'success' && result.authentication?.idToken) {
        const credential = GoogleAuthProvider.credential(result.authentication.idToken);
        return await signInWithCredential(auth, credential);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  return {
    handleGoogleSignIn,
    isLoading: !request,
    redirectUri,
  };
}

