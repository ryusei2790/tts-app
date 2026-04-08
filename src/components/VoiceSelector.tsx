/**
 * @file VoiceSelector.tsx
 * @description 音声タイプ選択コンポーネント。
 * 要件定義書に定義された5種類の日本語音声から選択できるセレクトボックスを提供する。
 */

"use client";

/** 音声タイプの定義 */
export interface VoiceOption {
  id: string;
  label: string;
  gender: "男性" | "女性";
  type: "Neural2" | "Standard";
  description: string;
}

/** 利用可能な音声タイプ一覧（要件定義書 2-2 より） */
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "ja-JP-Neural2-B",
    label: "Neural2-B（男性）",
    gender: "男性",
    type: "Neural2",
    description: "自然で落ち着いたナレーター向け",
  },
  {
    id: "ja-JP-Neural2-C",
    label: "Neural2-C（女性）",
    gender: "女性",
    type: "Neural2",
    description: "明るく聞きやすい",
  },
  {
    id: "ja-JP-Neural2-D",
    label: "Neural2-D（男性）",
    gender: "男性",
    type: "Neural2",
    description: "低めで落ち着いたトーン",
  },
  {
    id: "ja-JP-Standard-A",
    label: "Standard-A（女性）",
    gender: "女性",
    type: "Standard",
    description: "標準的な日本語音声",
  },
  {
    id: "ja-JP-Standard-B",
    label: "Standard-B（男性）",
    gender: "男性",
    type: "Standard",
    description: "標準的な日本語音声",
  },
];

interface VoiceSelectorProps {
  /** 現在選択されている音声ID */
  value: string;
  /** 選択変更時のコールバック */
  onChange: (voiceId: string) => void;
  /** 送信中かどうか */
  disabled?: boolean;
}

/**
 * 音声タイプを選択するセレクトボックスコンポーネント
 */
export default function VoiceSelector({ value, onChange, disabled = false }: VoiceSelectorProps) {
  const selected = VOICE_OPTIONS.find((v) => v.id === value);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="voice-select" className="font-semibold text-gray-700">
        音声タイプ
      </label>

      <select
        id="voice-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-300
          disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {VOICE_OPTIONS.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.label} — {voice.description}
          </option>
        ))}
      </select>

      {/* 選択中の音声の詳細情報 */}
      {selected && (
        <p className="text-xs text-gray-500">
          種別：{selected.type} / 性別：{selected.gender}
        </p>
      )}
    </div>
  );
}
