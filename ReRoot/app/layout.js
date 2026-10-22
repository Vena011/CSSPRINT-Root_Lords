import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata = {
  title: "Firebase Login",
  description: "Next.js login page backed by Firebase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
