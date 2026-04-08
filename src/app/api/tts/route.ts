/**
 * @file route.ts
 * @description TTS APIエンドポイント（POST /api/tts）。
 * クライアントからテキストと音声タイプを受け取り、
 * Google Cloud Text-to-Speech APIを呼び出して MP3 バイナリを返す。
 *
 * セキュリティ上の理由から、GCPの認証情報はこのサーバーサイドファイルのみで扱い
 * クライアントには一切露出させない。
 */

import { NextRequest, NextResponse } from "next/server";
import TextToSpeech from "@google-cloud/text-to-speech";

/** 1リクエストあたりの文字数上限（Google Cloud TTS の仕様） */
const MAX_CHARS = 5000;

/** 許可された音声IDのホワイトリスト（予期しない音声IDの注入を防ぐ） */
const ALLOWED_VOICES = new Set([
  "ja-JP-Neural2-B",
  "ja-JP-Neural2-C",
  "ja-JP-Neural2-D",
  "ja-JP-Standard-A",
  "ja-JP-Standard-B",
]);

/**
 * GCPクライアントを環境変数から初期化する。
 * GOOGLE_APPLICATION_CREDENTIALS_JSON に1行JSON文字列を設定する。
 * ファイルパスではなくJSONそのものを使うことでDockerでのファイルマウントが不要になる。
 */
function createTTSClient(): TextToSpeech.TextToSpeechClient {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!credentialsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON が設定されていません");
  }

  const credentials = JSON.parse(credentialsJson);

  return new TextToSpeech.TextToSpeechClient({ credentials });
}

/**
 * POST /api/tts
 * @param request - { text: string, voice: string }
 * @returns 成功時: MP3バイナリ（audio/mpeg）、失敗時: { error: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { text, voice } = body as { text: string; voice: string };

    // --- バリデーション ---

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "テキストを入力してください" }, { status: 400 });
    }

    if (text.length > MAX_CHARS) {
      return NextResponse.json(
        { error: `テキストは${MAX_CHARS.toLocaleString()}文字以内にしてください` },
        { status: 400 }
      );
    }

    if (!voice || !ALLOWED_VOICES.has(voice)) {
      return NextResponse.json({ error: "無効な音声タイプです" }, { status: 400 });
    }

    // --- Google Cloud TTS API呼び出し ---

    const client = createTTSClient();

    const [response] = await client.synthesizeSpeech({
      input: { text: text.trim() },
      voice: {
        languageCode: "ja-JP",
        name: voice,
      },
      audioConfig: {
        // MP3形式で出力
        audioEncoding: "MP3",
      },
    });

    if (!response.audioContent) {
      throw new Error("音声データが取得できませんでした");
    }

    // synthesizeSpeech は Uint8Array | string を返す場合があるので Buffer に統一する
    const audioBuffer =
      response.audioContent instanceof Uint8Array
        ? Buffer.from(response.audioContent)
        : Buffer.from(response.audioContent as string, "base64");

    // MP3バイナリをレスポンスとして返す
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[TTS API Error]", error);

    const message =
      error instanceof Error ? error.message : "音声生成中にエラーが発生しました";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
