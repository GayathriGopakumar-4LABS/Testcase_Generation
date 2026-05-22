"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/components/ui/use-toast";
import { getApiErrorMessage } from "@/lib/utils";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    sessionStorage.removeItem("qa-generator-generate-session");
    clearAuth();
    queryClient.clear();
    router.push("/login");
  };
}
