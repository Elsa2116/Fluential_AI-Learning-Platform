import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "AI Learning Platform",
  description: "AI-powered web-based learning platform frontend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
