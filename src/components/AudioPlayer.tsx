/**
 * @file AudioPlayer.tsx
 * @description 音声プレビュー再生・MP3ダウンロードコンポーネント。
 * 生成された MP3 の Blob URL を受け取り、ブラウザの audio 要素で再生する。
 * ダウンロードボタンで MP3 ファイルをローカルに保存できる。
 */

"use client";

interface AudioPlayerProps {
  /** 生成されたMP3のオブジェクトURL（null の場合は非表示） */
  audioUrl: string | null;
}

/**
 * 音声再生・ダウンロードUIを提供するコンポーネント
 */
export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  if (!audioUrl) return null;

  /**
   * MP3 ファイルをダウンロードする処理。
   * <a> タグに download 属性を付けてクリックすることで
   * ブラウザのダウンロードダイアログを発火させる。
   */
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `tts_${Date.now()}.mp3`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-semibold text-blue-700">✅ 音声が生成されました</p>

      {/* ブラウザネイティブの音声プレーヤー */}
      <audio
        controls
        src={audioUrl}
        className="w-full"
        aria-label="生成された音声のプレビュープレーヤー"
      />

      {/* ダウンロードボタン */}
      <button
        onClick={handleDownload}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white
          hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        MP3 をダウンロード
      </button>
    </div>
  );
}
