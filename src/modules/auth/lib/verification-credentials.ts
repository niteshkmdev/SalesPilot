/**
 * A temporary store using sessionStorage to hold the user's password during
 * the email verification polling phase.
 * 
 * Using sessionStorage ensures the auto-login survives if the user refreshes
 * the page while waiting, but automatically disappears when the tab is closed
 * or when explicitly cleared after a successful login.
 */

const STORAGE_KEY = "salespilot_temp_verify_pwd";

export function setTemporaryPassword(password: string) {
  if (typeof window !== "undefined") {
    if (password) {
      sessionStorage.setItem(STORAGE_KEY, password);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function getTemporaryPassword(): string {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  }
  return "";
}
