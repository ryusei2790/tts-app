/**
 * @file page.tsx
 * @description マークダウン要約ページ（/summarize）。
 * マークダウンテキストを貼り付けて Vertex AI Gemini で要約し、
 * 2,000字以内のプレーンテキストとして表示・.txtダウンロードできる。
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import TextInput from "@/components/TextInput";
import SummaryResult from "@/components/SummaryResult";
import Section from "@/components/section";
import Container from "@/components/container";
import Heading from "@/components/heading";
import Text from "@/components/text";
import Column from "@/components/column";
import Row from "@/components/row";
import Card from "@/components/card";
import Button from "@/components/button";

/**
 * 要約ページコンポーネント
 */
export default function SummarizePage() {
  const [markdown, setMarkdown] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOverLimit = markdown.length > 5000;

  /**
   * 要約生成ボタンのハンドラー。
   * POST /api/summarize を呼び出し、返ってきた summary テキストをセットする。
   */
  const handleSummarize = async () => {
    setError(null);
    setSummary(null);
    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "要約に失敗しました");
      }

      const data = await res.json();
      setSummary(data.summary);
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
                要約ツール
              </Heading>
              <Text fontClass="body" color="outline">
                マークダウンを貼り付けて2,000字以内の要約.txtを生成します
              </Text>
            </Column>
            <Link href="/">
              <Button label="音声生成へ" variant="text" color="primary" size="sm" startIcon="arrow-left" />
            </Link>
          </Row>

          {/* メインフォーム */}
          <Card variant="outline" scaleFactor="title2" opticalCorrection="all">
            <Column gap="lg">
              {/* マークダウン入力（既存のTextInputを流用） */}
              <TextInput
                value={markdown}
                onChange={setMarkdown}
                disabled={loading}
              />

              {/* 生成ボタン */}
              <Button
                label={loading ? "要約中..." : "要約を生成する"}
                variant="fill"
                color="tertiary"
                size="lg"
                startIcon={loading ? "loader" : "file-text"}
                disabled={loading || markdown.trim().length === 0 || isOverLimit}
                onClick={handleSummarize}
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

          {/* 要約結果 */}
          <SummaryResult summary={summary} />
        </Column>
      </Container>
    </Section>
  );
}
