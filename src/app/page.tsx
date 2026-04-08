/**
 * @file page.tsx
 * @description TTSアプリのメインページ。
 * テキスト入力・音声タイプ選択・生成ボタン・プレビュー再生・エラー表示を統合管理する。
 * 各コンポーネントの状態（text, voice, audioUrl, error, loading）をここで一元管理する。
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import TextInput from "@/components/TextInput";
import VoiceSelector from "@/components/VoiceSelector";
import AudioPlayer from "@/components/AudioPlayer";
import { VOICE_OPTIONS } from "@/components/VoiceSelector";

/**
 * メインページコンポーネント
 * 状態管理と API 呼び出しのロジックをここに集約する。
 */
export default function Home() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(VOICE_OPTIONS[0].id);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOverLimit = text.length > 5000;

  /**
   * 音声生成ボタンのハンドラー。
   * POST /api/tts を呼び出し、返ってきたMP3バイナリをBlobURLに変換して
   * AudioPlayerに渡す。
   */
  const handleGenerate = async () => {
    setError(null);
    setAudioUrl(null);
    setLoading(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (!res.ok) {
        // エラーレスポンスは JSON { error: string } 形式
        const data = await res.json();
        throw new Error(data.error ?? "音声生成に失敗しました");
      }

      // 成功時はMP3バイナリが返ってくるのでBlobURLに変換する
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // 前回のBlobURLをメモリ解放してから新しいURLをセット
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎙️ TTS App</h1>
          <p className="mt-1 text-sm text-gray-500">
            テキストを貼り付けて音声を生成・再生・ダウンロードできます
          </p>
        </div>
        <Link href="/summarize" className="text-sm text-green-600 hover:underline">
          要約ツールへ →
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {/* テキスト入力 */}
        <TextInput value={text} onChange={setText} disabled={loading} />

        {/* 音声タイプ選択 */}
        <VoiceSelector value={voice} onChange={setVoice} disabled={loading} />

        {/* 生成ボタン */}
        <button
          onClick={handleGenerate}
          disabled={loading || text.trim().length === 0 || isOverLimit}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white
            hover:bg-indigo-700 active:bg-indigo-800 transition-colors
            disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "生成中..." : "音声を生成する"}
        </button>

        {/* エラー表示 */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            ❌ {error}
          </div>
        )}

        {/* 音声プレーヤー */}
        <AudioPlayer audioUrl={audioUrl} />
      </div>
    </main>
  );
}
