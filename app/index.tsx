import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to splash screen first
  return <Redirect href="/Splash" />;
}