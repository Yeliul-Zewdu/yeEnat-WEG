/**
 * Token persistence backed by AsyncStorage (works on web, iOS, Android).
 * Stores the JWT access/refresh pair returned by the auth endpoints.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_KEY = "yew.access";
const REFRESH_KEY = "yew.refresh";

export type Tokens = {
  access: string;
  refresh: string;
};

export async function getTokens(): Promise<Tokens | null> {
  try {
    const [access, refresh] = await Promise.all([
      AsyncStorage.getItem(ACCESS_KEY),
      AsyncStorage.getItem(REFRESH_KEY),
    ]);
    if (!access || !refresh) return null;
    return { access, refresh };
  } catch {
    return null;
  }
}

export async function setTokens(tokens: Tokens): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_KEY, tokens.access],
    [REFRESH_KEY, tokens.refresh],
  ]);
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}
