import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ヒット曲クイズ",
  description: "年代を入力してヒット曲クイズを楽しもう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}