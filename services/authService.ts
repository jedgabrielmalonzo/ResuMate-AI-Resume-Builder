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
const GOOGLE_ANDROID_CLIENT_ID = '830045302104-bqi1ceklg5tvogvekidr172lp03vln7m.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '830045302104-1d0ogdi83l2sfb1avr98brmd73ibb1bh.apps.googleusercontent.com';

/**
 * Hook to handle Google Sign-In using Authorization Code flow.
 */
export function useGoogleAuth() {
  const { signInWithGoogle } = useAuth();

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'resumate',
    path: 'oauthredirect',
  });

  // Log on first use so user can add this to Google Console
  useEffect(() => {
    console.log('🔑 Google OAuth Redirect URI (add this to Google Console):', redirectUri);
  }, [redirectUri]);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        android: GOOGLE_ANDROID_CLIENT_ID,
        ios: GOOGLE_IOS_CLIENT_ID,
        default: GOOGLE_WEB_CLIENT_ID,
      }),
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

