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
import Section from "@/components/section";
import Container from "@/components/container";
import Heading from "@/components/heading";
import Text from "@/components/text";
import Column from "@/components/column";
import Row from "@/components/row";
import Card from "@/components/card";
import Button from "@/components/button";

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
        const data = await res.json();
        throw new Error(data.error ?? "音声生成に失敗しました");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

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
    <Section padding="md">
      <Container maxWidth="md" style={{ maxWidth: "720px" }}>
        <Column gap="xl">
          {/* ヘッダー */}
          <Row alignItems="center" justifyContent="space-between">
            <Column gap="xs">
              <Heading tag="h1" fontClass="display2-bold">
                TTS App
              </Heading>
              <Text fontClass="body" color="outline">
                テキストを貼り付けて音声を生成・再生・ダウンロードできます
              </Text>
            </Column>
            <Link href="/summarize">
              <Button label="要約ツールへ" variant="text" color="tertiary" size="sm" endIcon="arrow-right" />
            </Link>
          </Row>

          {/* メインフォーム */}
          <Card variant="outline" scaleFactor="title2" opticalCorrection="all">
            <Column gap="lg">
              {/* テキスト入力 */}
              <TextInput value={text} onChange={setText} disabled={loading} />

              {/* 音声タイプ選択 */}
              <VoiceSelector value={voice} onChange={setVoice} disabled={loading} />

              {/* 生成ボタン */}
              <Button
                label={loading ? "生成中..." : "音声を生成する"}
                variant="fill"
                color="primary"
                size="lg"
                startIcon={loading ? "loader" : "volume-2"}
                disabled={loading || text.trim().length === 0 || isOverLimit}
                onClick={handleGenerate}
                modifiers="w-full justify-center"
              />
            </Column>
          </Card>

          {/* エラー表示 */}
          {error && (
            <Card variant="fill" bgColor="errorcontainer" scaleFactor="heading">
              <Text fontClass="body" color="onerrorcontainer">
                {error}
              </Text>
            </Card>
          )}

          {/* 音声プレーヤー */}
          <AudioPlayer audioUrl={audioUrl} />
        </Column>
      </Container>
    </Section>
  );
}
