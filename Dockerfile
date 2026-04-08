# ベースイメージ：軽量なNode.js 20（Alpine Linux）
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルを先にコピーしてキャッシュを活用する
# package.jsonだけ変わっていない場合はnpm installをスキップできる
COPY package.json package-lock.json* ./

# 依存パッケージをインストール
RUN npm install

# ソースコードをコピー
COPY . .

# 開発サーバーポート
EXPOSE 3000

# 開発モードで起動
CMD ["npm", "run", "dev"]
