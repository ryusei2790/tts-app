/**
 * @file page.tsx
 * @description マークダウン要約ページ（/summarize）。
 * マークダウンテキストを貼り付けて Vertex AI Gemini で要約し、
 * 2,000字以内のプレーンテキストとして表示・.txtダウンロードできる。
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import TextInput from "@/components/TextInput";
import SummaryResult from "@/components/SummaryResult";

/**
 * 要約ページコンポーネント
 */
export default function SummarizePage() {
  const [markdown, setMarkdown] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOverLimit = markdown.length > 5000;

  /**
   * 要約生成ボタンのハンドラー。
   * POST /api/summarize を呼び出し、返ってきた summary テキストをセットする。
   */
  const handleSummarize = async () => {
    setError(null);
    setSummary(null);
    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "要約に失敗しました");
      }

      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* ヘッダー */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 要約ツール</h1>
          <p className="mt-1 text-sm text-gray-500">
            マークダウンを貼り付けて2,000字以内の要約.txtを生成します
          </p>
        </div>
        {/* TTSページへのリンク */}
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← 音声生成へ
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {/* マークダウン入力（既存のTextInputを流用） */}
        <TextInput
          value={markdown}
          onChange={setMarkdown}
          disabled={loading}
        />

        {/* 生成ボタン */}
        <button
          onClick={handleSummarize}
          disabled={loading || markdown.trim().length === 0 || isOverLimit}
          className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white
            hover:bg-green-700 active:bg-green-800 transition-colors
            disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "要約中..." : "要約を生成する"}
        </button>

        {/* エラー表示 */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            ❌ {error}
          </div>
        )}

        {/* 要約結果 */}
        <SummaryResult summary={summary} />
      </div>
    </main>
  );
}
