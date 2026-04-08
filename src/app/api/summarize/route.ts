/**
 * @file route.ts
 * @description 要約APIエンドポイント（POST /api/summarize）。
 * クライアントからマークダウンテキストを受け取り、
 * Vertex AI の Gemini モデルを呼び出して2,000字以内の要約テキストを返す。
 *
 * 認証情報は TTS と同じ GOOGLE_APPLICATION_CREDENTIALS_JSON を流用する。
 */

import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

/** 要約の最大文字数 */
const MAX_OUTPUT_CHARS = 2000;

/** 入力マークダウンの最大文字数（過大な入力を弾く） */
const MAX_INPUT_CHARS = 20000;

/** 使用するGeminiモデル */
const MODEL = "gemini-1.5-flash";

/** Vertex AIのリージョン */
const LOCATION = "us-central1";

/**
 * Vertex AI クライアントを環境変数から初期化する。
 * サービスアカウントJSONを credentials として渡す。
 */
function createVertexClient(): VertexAI {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!credentialsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON が設定されていません");
  }

  const credentials = JSON.parse(credentialsJson);

  return new VertexAI({
    project: credentials.project_id,
    location: LOCATION,
    googleAuthOptions: { credentials },
  });
}

/**
 * マークダウン記法を取り除いてプレーンテキストに変換する。
 * Gemini に渡す前に整形することでトークンを節約する。
 */
function stripMarkdown(markdown: string): string {
  return markdown
    // コードブロックを除去
    .replace(/```[\s\S]*?```/g, "")
    // インラインコードを除去
    .replace(/`[^`]+`/g, "")
    // 見出し記号を除去
    .replace(/^#{1,6}\s+/gm, "")
    // 太字・斜体を除去
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    // リンクをテキストのみに
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // テーブル区切り行を除去
    .replace(/^\|[-| :]+\|$/gm, "")
    // 空行を1行に整理
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * POST /api/summarize
 * @param request - { markdown: string }
 * @returns 成功時: { summary: string }、失敗時: { error: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { markdown } = body as { markdown: string };

    // --- バリデーション ---

    if (!markdown || typeof markdown !== "string" || markdown.trim().length === 0) {
      return NextResponse.json({ error: "テキストを入力してください" }, { status: 400 });
    }

    if (markdown.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        { error: `入力は${MAX_INPUT_CHARS.toLocaleString()}文字以内にしてください` },
        { status: 400 }
      );
    }

    // --- マークダウンをプレーンテキストに変換 ---
    const plainText = stripMarkdown(markdown);

    // --- Vertex AI Gemini 呼び出し ---
    const vertexAI = createVertexClient();
    const generativeModel = vertexAI.getGenerativeModel({ model: MODEL });

    const prompt = `以下のブログ記事を、${MAX_OUTPUT_CHARS}文字以内の日本語で要約してください。
要約はSNS投稿やブログの紹介文として使える、読みやすい文章にしてください。
マークダウン記法は使わず、プレーンテキストで出力してください。

---
${plainText}
---`;

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const summary = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!summary) {
      throw new Error("要約テキストが取得できませんでした");
    }

    return NextResponse.json({ summary: summary.trim() }, { status: 200 });
  } catch (error) {
    console.error("[Summarize API Error]", error);

    const message =
      error instanceof Error ? error.message : "要約中にエラーが発生しました";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
