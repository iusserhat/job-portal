/**
 * Storage service is used to interact with localStorage.
 */
export default class StorageService {
  /**
   * Sets an item in localStorage.
   * @param key - The key to store the item under.
   * @param value - The value to store.
   */
  public static setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("StorageService setItem error:", e);
    }
  }

  /**
   * Gets an item from localStorage.
   * @param key - The key to retrieve.
   * @returns The value stored under the key, or null if not found.
   */
  public static getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("StorageService getItem error:", e);
      return null;
    }
  }

  /**
   * Removes an item from localStorage.
   * @param key - The key to remove.
   */
  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("StorageService removeItem error:", e);
    }
  }

  /**
   * Clears all items from localStorage.
   */
  public static clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("StorageService clear error:", e);
    }
  }
}
