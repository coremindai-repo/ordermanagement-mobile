import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { registerDevice } from "../api/auth";

function currentPlatform(): "ios" | "android" | null {
  return Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : null;
}

/** Requests permission and registers the device's Expo push token with the backend. Best-effort. */
export async function registerForPushNotificationsAsync(): Promise<void> {
  const platform = currentPlatform();
  if (!platform) {
    return;
  }

  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device — skipping registration.");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted — skipping registration.");
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    await registerDevice(platform, tokenResponse.data);
  } catch (err) {
    console.warn("Could not obtain/register Expo push token:", err);
  }
}

/** Re-registers with the backend whenever Expo issues a new push token (contract §2). */
export function subscribeToPushTokenRefresh(): () => void {
  const platform = currentPlatform();
  if (!platform) {
    return () => {};
  }

  const subscription = Notifications.addPushTokenListener(async (tokenResponse) => {
    try {
      await registerDevice(platform, tokenResponse.data);
    } catch (err) {
      console.warn("Could not re-register refreshed push token:", err);
    }
  });

  return () => subscription.remove();
}
