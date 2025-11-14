import type { Metadata } from "next";

import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";





export const metadata: Metadata = {
  title: "Law & Verdict",
  description: "Login Page for Law & Verdict Application",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning

      >

        <UserProvider> {children}</UserProvider>

      </body>
    </html>
  );
}
