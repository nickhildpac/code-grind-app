import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { _maxLength } from "zod/v4/core";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigninUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/me");
      console.log("checkauth response ", res.data);
      set({ authUser: res.data.data });
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Error logging in");
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigninUp: true });
    try {
      console.log("checkauth reque4st ", data);
      const res = await axiosInstance.post("/auth/register", data);
      console.log("checkauth response ", res.data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Error signing up ");
    } finally {
      set({ isSigninUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      console.log("checkauth response ", res.data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Error logging in");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error logging out");
    }
  },
}));
