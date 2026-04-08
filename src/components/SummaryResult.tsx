/**
 * @file SummaryResult.tsx
 * @description 要約結果の表示・.txtダウンロードコンポーネント。
 * 生成された要約テキストを表示し、.txtファイルとしてダウンロードできる。
 */

"use client";

interface SummaryResultProps {
  /** 生成された要約テキスト（null の場合は非表示） */
  summary: string | null;
}

/**
 * 要約テキストの表示とダウンロードUIを提供するコンポーネント
 */
export default function SummaryResult({ summary }: SummaryResultProps) {
  if (!summary) return null;

  /**
   * 要約テキストを .txt ファイルとしてダウンロードする。
   * Blob を作成して BlobURL 経由でダウンロードを発火させる。
   * UTF-8 BOM を付与することで Windows のメモ帳でも文字化けしない。
   */
  const handleDownload = () => {
    // UTF-8 BOM + テキスト本文
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const content = new TextEncoder().encode(summary);
    const blob = new Blob([bom, content], { type: "text/plain;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `summary_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-sm font-semibold text-green-700">✅ 要約が生成されました</p>

      {/* 要約テキスト表示エリア */}
      <div className="rounded-lg border border-green-200 bg-white p-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
        {summary}
      </div>

      {/* 文字数表示 */}
      <p className="text-right text-xs text-gray-500">
        {summary.length.toLocaleString()} 文字
      </p>

      {/* ダウンロードボタン */}
      <button
        onClick={handleDownload}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white
          hover:bg-green-700 active:bg-green-800 transition-colors"
      >
        .txt をダウンロード
      </button>
    </div>
  );
}
