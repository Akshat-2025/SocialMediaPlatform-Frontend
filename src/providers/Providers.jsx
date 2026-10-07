"use client";

import { useEffect, useState } from "react";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { store } from "@/store/store";
import { setUnauthorizedHandler } from "@/lib/axios";
import { clearUser } from "@/store/slices/authSlice";
import { disconnectSocket } from "@/lib/socket";

function AuthBridge() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Wires the axios interceptor (a plain module, outside React) to Redux so
    // an unrecoverable 401 (refresh also failed) clears client auth state.
    setUnauthorizedHandler(() => {
      dispatch(clearUser());
      disconnectSocket();
    });
  }, [dispatch]);

  return null;
}

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30 * 1000,
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthBridge />
          {children}
          <Toaster position="bottom-right" richColors closeButton />
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
