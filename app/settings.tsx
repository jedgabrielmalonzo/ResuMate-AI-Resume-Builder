import { Redirect } from "expo-router";

export default function SettingsRedirect() {
  // Since we are using a PagerView in /home, we redirect there.
  return <Redirect href="/home" />;
}
