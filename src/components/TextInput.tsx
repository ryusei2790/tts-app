/**
 * @file TextInput.tsx
 * @description テキスト入力エリアコンポーネント。
 * ユーザーが読み上げたいテキストを入力し、文字数をリアルタイムで表示する。
 * 上限 5,000 文字を超えた場合は警告スタイルを表示する。
 * LiftKit のゴールデンレシオ CSS 変数でスタイリング。
 */

"use client";

import Column from "@/components/column";
import Text from "@/components/text";
import Row from "@/components/row";

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
    <Column gap="xs">
      <Text tag="label" fontClass="subheading-bold" color="onsurface">
        読み上げるテキスト
      </Text>

      <textarea
        id="tts-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={10}
        placeholder="ここにテキストを貼り付けてください..."
        className={`lk-textarea ${isOverLimit ? "lk-textarea--error" : ""}`}
      />

      {/* 文字数カウンター */}
      <Row justifyContent="end" alignItems="center">
        <Text
          fontClass="caption"
          color={isOverLimit ? "error" : "outline"}
        >
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} 文字
          {isOverLimit && " — 上限を超えています"}
        </Text>
      </Row>
    </Column>
  );
}
