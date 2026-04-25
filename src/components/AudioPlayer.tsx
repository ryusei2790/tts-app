/**
 * @file AudioPlayer.tsx
 * @description 音声プレビュー再生・MP3ダウンロードコンポーネント。
 * 生成された MP3 の Blob URL を受け取り、ブラウザの audio 要素で再生する。
 * ダウンロードボタンで MP3 ファイルをローカルに保存できる。
 * LiftKit Card + Button でスタイリング。
 */

"use client";

import Card from "@/components/card";
import Column from "@/components/column";
import Text from "@/components/text";
import Button from "@/components/button";

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
    <Card variant="fill" bgColor="primarycontainer" scaleFactor="title2" opticalCorrection="all">
      <Column gap="lg">
        <Text fontClass="subheading-bold" color="onprimarycontainer">
          音声が生成されました
        </Text>

        {/* ブラウザネイティブの音声プレーヤー */}
        <audio
          controls
          src={audioUrl}
          className="w-full"
          aria-label="生成された音声のプレビュープレーヤー"
        />

        {/* ダウンロードボタン */}
        <Button
          label="MP3 をダウンロード"
          variant="fill"
          color="primary"
          size="md"
          startIcon="download"
          onClick={handleDownload}
          modifiers="w-full justify-center"
        />
      </Column>
    </Card>
  );
}
