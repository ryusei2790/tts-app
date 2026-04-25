/**
 * @file layout.tsx
 * @description アプリ全体のルートレイアウト。
 * すべてのページに共通する HTML 構造・メタ情報・グローバルスタイルを定義する。
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TTS App - テキスト音声変換",
  description: "テキストを貼り付けてMP3を生成・再生・ダウンロードできるWebアプリ",
};

/**
 * ルートレイアウトコンポーネント
 * Next.js App Router では必須の最上位レイアウト。
 * @param children - 各ページのコンテンツ
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-background color-onbackground">
        {children}
      </body>
    </html>
  );
}
