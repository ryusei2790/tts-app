# 要件定義書：tts-app

**作成日：** 2026-04-06
**作成者：** ryusei Ueda
**バージョン：** 1.0.0

---

## 1. プロジェクト概要

### 1-1. 背景・目的

ブログ記事を動画コンテンツに転用する際、音声ナレーションを毎回手動で生成するのが非効率。
テキストを貼り付けてボタン1つで MP3 を生成・再生・ダウンロードできる Web アプリを構築し、コンテンツ制作フローを効率化する。

### 1-2. ターゲットユーザー

| 項目 | 内容 |
|------|------|
| 利用者 | ryusei 本人（個人利用） |
| 利用シーン | ブログ記事を動画化するときの音声素材生成 |
| 技術レベル | JavaScript / Next.js を学習中 |

---

## 2. 機能要件

### 2-1. 必須機能（MVP）

| # | 機能 | 説明 |
|---|------|------|
| F-01 | テキスト入力 | テキストエリアに文章を貼り付けられる |
| F-02 | 文字数カウント | 入力文字数をリアルタイム表示（上限5,000文字） |
| F-03 | 音声タイプ選択 | 日本語音声の種類を選択できる（標準・Neural2） |
| F-04 | 音声生成 | ボタン押下で Google Cloud TTS を呼び出し MP3 を生成する |
| F-05 | プレビュー再生 | 生成した音声をブラウザ上で再生できる |
| F-06 | MP3ダウンロード | 生成した音声ファイルをローカルに保存できる |
| F-07 | エラー表示 | API エラー時にわかりやすいメッセージを表示する |

### 2-2. 対応音声タイプ

| 音声ID | 性別 | 種類 | 特徴 |
|--------|------|------|------|
| ja-JP-Neural2-B | 男性 | Neural2 | 自然で落ち着いたナレーター向け |
| ja-JP-Neural2-C | 女性 | Neural2 | 明るく聞きやすい |
| ja-JP-Neural2-D | 男性 | Neural2 | 低めで落ち着いたトーン |
| ja-JP-Standard-A | 女性 | Standard | 標準的な日本語音声 |
| ja-JP-Standard-B | 男性 | Standard | 標準的な日本語音声 |

### 2-3. 将来対応（スコープ外）

- 長文の自動分割処理（5,000文字超対応）
- 生成済み音声ファイルの履歴管理
- Notion 連携（DB から記事を自動取得）
- Google Cloud Storage への保存

---

## 3. 非機能要件

| 項目 | 要件 |
|------|------|
| 動作環境 | Docker（ローカル開発）/ Vercel または Cloud Run（将来のクラウド移行） |
| レスポンス | 音声生成リクエストから5秒以内にレスポンス |
| セキュリティ | APIキーはサーバーサイドのみで使用（クライアントに露出させない） |
| 対応ブラウザ | Chrome 最新版（個人利用のため最低限） |
| 文字数制限 | 1リクエスト最大 5,000 文字（Google Cloud TTS の上限） |

---

## 4. 技術スタック

| カテゴリ | 採用技術 | 理由 |
|---------|---------|------|
| フロントエンド | Next.js 15（App Router） | API Routes と UI を一体管理できる |
| 言語 | TypeScript | 型安全・補完が効く |
| スタイリング | Tailwind CSS | 高速にUIを組める |
| TTS SDK | @google-cloud/text-to-speech | 公式SDK・型定義あり |
| インフラ | Docker（node:20-alpine） | ローカル環境を再現可能にする |
| 認証 | サービスアカウント JSON（環境変数） | Docker 内でファイルパス管理不要 |

---

## 5. システム構成

```
[ブラウザ]
    ↓ テキスト + 音声タイプ を POST
[Next.js Route Handler: /api/tts]
    ↓ synthesizeSpeech()
[Google Cloud TTS API]
    ↓ MP3 バイナリ
[Next.js Route Handler]
    ↓ audio/mpeg レスポンス
[ブラウザ]
    → 再生 / ダウンロード
```

---

## 6. ディレクトリ構成

```
tts-app/
├── docs/
│   └── requirements.md        ← 本ファイル
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .env.local                 ← gitignore（APIキー）
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── api/
    │       └── tts/
    │           └── route.ts
    └── components/
        ├── TextInput.tsx
        ├── VoiceSelector.tsx
        └── AudioPlayer.tsx
```

---

## 7. 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | GCP サービスアカウント JSON（1行） | ✅ |

---

## 8. API 仕様

### POST `/api/tts`

**リクエスト**

```json
{
  "text": "読み上げるテキスト",
  "voice": "ja-JP-Neural2-B"
}
```

**レスポンス（成功時）**

```
Content-Type: audio/mpeg
Body: MP3 バイナリ
```

**レスポンス（エラー時）**

```json
{
  "error": "エラーメッセージ"
}
```

---

## 9. 開発フロー

```
① GCP セットアップ（docs/gcp-setup.md 参照）
      ↓
② docker-compose up で開発サーバー起動
      ↓
③ http://localhost:3000 でアプリ確認
      ↓
④ テキスト貼り付け → 生成 → 再生 / DL
```

---

## 10. 受け入れ条件

- [ ] テキストを貼り付けてボタンを押すと MP3 が生成される
- [ ] 生成した音声がブラウザ上で再生できる
- [ ] MP3 ファイルをダウンロードできる
- [ ] 5,000 文字を超えたとき警告が表示される
- [ ] API エラー時にエラーメッセージが表示される
- [ ] `docker-compose up` だけで起動できる
