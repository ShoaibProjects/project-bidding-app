import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define the user information type
interface UserInfo {
  email: string;
  name?: string;
  id: string;
  role: string;
  description?: string;
}

// Define the store state and actions
interface UserState {
  user: UserInfo | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserInfo) => void;
  updateUser: (updates: Partial<UserInfo>) => void;
  clearUser: () => void;
}

// Create the store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // Set the entire user object
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      // Update specific user fields
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Clear user data (logout)
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "user-storage", // Name for the storage key
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    },
  ),
);
