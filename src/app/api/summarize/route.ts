/**
 * @file route.ts
 * @description 要約APIエンドポイント（POST /api/summarize）。
 * クライアントからマークダウンテキストを受け取り、
 * Google Gen AI SDK（@google/genai）経由で Vertex AI Gemini を呼び出して
 * 2,000字以内の要約テキストを返す。
 *
 * 認証情報は TTS と同じ GOOGLE_APPLICATION_CREDENTIALS_JSON を流用する。
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/** 要約の最大文字数 */
const MAX_OUTPUT_CHARS = 2000;

/** 入力マークダウンの最大文字数（過大な入力を弾く） */
const MAX_INPUT_CHARS = 20000;

/** 使用するGeminiモデル */
const MODEL = "gemini-2.0-flash";

/** Vertex AIのリージョン */
const LOCATION = "us-central1";

/**
 * Google Gen AI クライアントを環境変数から初期化する。
 * Vertex AI モードで動作させるために vertexai: true を指定する。
 */
function createGenAIClient(): GoogleGenAI {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!credentialsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON が設定されていません");
  }

  const credentials = JSON.parse(credentialsJson);

  return new GoogleGenAI({
    vertexai: true,
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
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\|[-| :]+\|$/gm, "")
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

    if (!markdown || typeof markdown !== "string" || markdown.trim().length === 0) {
      return NextResponse.json({ error: "テキストを入力してください" }, { status: 400 });
    }

    if (markdown.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        { error: `入力は${MAX_INPUT_CHARS.toLocaleString()}文字以内にしてください` },
        { status: 400 }
      );
    }

    const plainText = stripMarkdown(markdown);
    const ai = createGenAIClient();

    const prompt = `以下のブログ記事を、${MAX_OUTPUT_CHARS}文字以内の日本語で要約してください。
要約はSNS投稿やブログの紹介文として使える、読みやすい文章にしてください。
マークダウン記法は使わず、プレーンテキストで出力してください。

---
${plainText}
---`;

    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const summary = result.text ?? "";

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
