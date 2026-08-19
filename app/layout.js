import "./globals.css";
import Navigation from "../components/Navigation";

export const metadata = {
  title: "HisabDo",
  description: "HisabDo - Your simple accounting/expense tracking companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
        <footer>
          <p>&copy; {new Date().getFullYear()} HisabDo. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
