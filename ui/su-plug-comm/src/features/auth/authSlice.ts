import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  vipLevel: number;
  balance: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Try to load state from localStorage
const loadState = (): AuthState | undefined => {
  try {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userStr && token) {
      return {
        user: JSON.parse(userStr),
        token,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    // Ignore invalid JSON
    console.error("Failed to load auth state", e);
  }
  return undefined;
};

const savedState = loadState();

const initialState: AuthState = savedState || {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
