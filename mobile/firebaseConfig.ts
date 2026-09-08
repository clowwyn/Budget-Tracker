import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '323697297833-lfp1k5m0d4paehd11lm93jagngcru1je.apps.googleusercontent.com',
  offlineAccess: true,
});

export { GoogleSignin };
