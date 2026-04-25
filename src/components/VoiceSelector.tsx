/**
 * @file VoiceSelector.tsx
 * @description 音声タイプ選択コンポーネント。
 * 要件定義書に定義された5種類の日本語音声から選択できる。
 * LiftKit Select コンポーネントでカスタムドロップダウンを実現。
 */

"use client";

import Column from "@/components/column";
import Text from "@/components/text";
import { Select, SelectTrigger, SelectMenu, SelectOption } from "@/components/select";
import Button from "@/components/button";
import React from "react";

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
 * 音声タイプを選択するカスタムドロップダウンコンポーネント
 */
export default function VoiceSelector({ value, onChange, disabled = false }: VoiceSelectorProps) {
  const selected = VOICE_OPTIONS.find((v) => v.id === value);

  const options = VOICE_OPTIONS.map((v) => ({
    label: `${v.label} — ${v.description}`,
    value: v.id,
  }));

  /**
   * LiftKit Select の onChange は React.ChangeEvent<HTMLSelectElement> を返すため
   * 内部で voiceId（string）に変換して親に渡す
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <Column gap="xs">
      <Text tag="label" fontClass="subheading-bold" color="onsurface">
        音声タイプ
      </Text>

      <div data-lk-select-disabled={disabled ? "true" : "false"}>
        <Select options={options} value={value} onChange={handleChange} name="voice-select">
          <SelectTrigger>
            <Button
              label={selected ? `${selected.label} — ${selected.description}` : "音声を選択"}
              variant="outline"
              color="onsurface"
              size="md"
              endIcon="chevron-down"
              modifiers="w-full justify-between text-left"
            />
          </SelectTrigger>
          <SelectMenu cardProps={{ variant: "fill", bgColor: "surfacecontainerlow" }}>
            {VOICE_OPTIONS.map((voice) => (
              <SelectOption key={voice.id} value={voice.id}>
                <Column gap="none">
                  <Text fontClass="body" tag="span">{voice.label}</Text>
                  <Text fontClass="caption" color="outline" tag="span">
                    {voice.description} / {voice.type} / {voice.gender}
                  </Text>
                </Column>
              </SelectOption>
            ))}
          </SelectMenu>
        </Select>
      </div>
    </Column>
  );
}
