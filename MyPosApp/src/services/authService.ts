import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from './firebaseConfig'; // Assuming you have firebaseConfig.ts
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = (webClientId: string, iosClientId: string, androidClientId: string) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId,
    androidClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return {
    promptAsync,
    isSigningIn: !!request,
  };
};

// You would also have functions for email/password, sign up, etc.
// e.g., export const signUpWithEmail = (...) => { ... }
// e.g., export const signInWithEmail = (...) => { ... }