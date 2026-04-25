/**
 * @file SummaryResult.tsx
 * @description 要約結果の表示・.txtダウンロードコンポーネント。
 * 生成された要約テキストを表示し、.txtファイルとしてダウンロードできる。
 * LiftKit Card + Button でスタイリング。
 */

"use client";

import Card from "@/components/card";
import Column from "@/components/column";
import Row from "@/components/row";
import Text from "@/components/text";
import Button from "@/components/button";

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
    <Card variant="fill" bgColor="tertiarycontainer" scaleFactor="title2" opticalCorrection="all">
      <Column gap="lg">
        <Text fontClass="subheading-bold" color="ontertiarycontainer">
          要約が生成されました
        </Text>

        {/* 要約テキスト表示エリア */}
        <Card variant="fill" bgColor="surfacecontainerlowest" scaleFactor="body" opticalCorrection="all">
          <Text fontClass="body" color="onsurface" style={{ whiteSpace: "pre-wrap", lineHeight: "var(--lk-wholestep)" }}>
            {summary}
          </Text>
        </Card>

        {/* 文字数表示 */}
        <Row justifyContent="end">
          <Text fontClass="caption" color="ontertiarycontainer">
            {summary.length.toLocaleString()} 文字
          </Text>
        </Row>

        {/* ダウンロードボタン */}
        <Button
          label=".txt をダウンロード"
          variant="fill"
          color="tertiary"
          size="md"
          startIcon="download"
          onClick={handleDownload}
          modifiers="w-full justify-center"
        />
      </Column>
    </Card>
  );
}
