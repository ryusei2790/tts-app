/**
 * @file TextInput.tsx
 * @description テキスト入力エリアコンポーネント。
 * ユーザーが読み上げたいテキストを入力し、文字数をリアルタイムで表示する。
 * 上限 5,000 文字を超えた場合は警告スタイルを表示する。
 */

"use client";

/** 文字数の上限（Google Cloud TTS の制約） */
const MAX_CHARS = 5000;

interface TextInputProps {
  /** 現在の入力テキスト */
  value: string;
  /** テキスト変更時のコールバック */
  onChange: (value: string) => void;
  /** 送信中（生成中）かどうか。trueのときは入力を無効化 */
  disabled?: boolean;
}

/**
 * テキスト入力エリアと文字数カウンターを表示するコンポーネント
 */
export default function TextInput({ value, onChange, disabled = false }: TextInputProps) {
  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="tts-input" className="font-semibold text-gray-700">
        読み上げるテキスト
      </label>

      <textarea
        id="tts-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={10}
        placeholder="ここにテキストを貼り付けてください..."
        className={`
          w-full rounded-lg border p-3 text-sm resize-y
          focus:outline-none focus:ring-2
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${isOverLimit
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300"
          }
        `}
      />

      {/* 文字数カウンター */}
      <div className={`text-right text-sm ${isOverLimit ? "text-red-500 font-semibold" : "text-gray-500"}`}>
        {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} 文字
        {isOverLimit && (
          <span className="ml-2">⚠️ 上限を超えています</span>
        )}
      </div>
    </div>
  );
}
