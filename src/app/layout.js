import { Providers } from "@/providers/Providers";
import "./globals.css";

export const metadata = {
  title: "Marginalia",
  description: "A place to write in the margins.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
