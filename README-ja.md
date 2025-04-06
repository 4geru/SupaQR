# Supabase QR Connector - フロントエンド

<img src="[ここに魅力的なスクリーンショットか GIF を挿入]" alt="アプリのスクリーンショット" width="600">

**CSV をアップロードするだけで、あなたのデータが Supabase ですぐに使えるリストに！✨**

Supabase QR Connector のフロントエンドアプリケーションです。このアプリを使えば、お手持ちの CSV ファイルを驚くほど簡単に Supabase プロジェクトに取り込み、管理可能なリストを作成できます。面倒な手入力や複雑な API 連携はもう必要ありません！

**こんなあなたにおすすめ！**

*   📈 Supabase を使っていて、もっと手軽にデータを登録したい方
*   📄 CSV 形式のデータをサッと Web アプリケーションで扱いたい方
*   ⏳ データ入力の手間を省き、開発や分析に集中したい方
*   💡 QR コード連携など、Supabase を活用した新しいアイデアを実現したい方 (バックエンド機能との連携)

---

## ✨ 主な機能

*   **🚀 簡単 CSV アップロード:** ドラッグ＆ドロップ感覚で CSV ファイルをアップロード。
*   **📄 自動リスト作成:** アップロードされた CSV を元に、Supabase 内に自動でリストとアイテムを作成。
*   **🔐 安全な認証:** Supabase Auth による安全なユーザー認証。あなたのデータは守られます。
*   **🌐 多言語対応:** 英語と日本語に対応 (他の言語も追加可能)。
*   **📱 レスポンシブデザイン:** デスクトップでもモバイルでも快適に操作。

---

## 🚀 使ってみよう！ (セットアップ)

### 必要なもの

*   [Node.js](https://nodejs.org/) (バージョン 18.x 以上推奨)
*   [pnpm](https://pnpm.io/) (または npm/yarn)
*   [Supabase プロジェクト](https://supabase.com/)

### 手順

1.  **リポジトリをクローン:**
    ```bash
    git clone https://github.com/4geru/supabase-qr-connector.git
    cd supabase-qr-connector/frontend
    ```

2.  **依存関係をインストール:**
    ```bash
    pnpm install
    # または npm install / yarn install
    ```

3.  **環境変数を設定:**
    `frontend` ディレクトリ直下に `.env` ファイルを作成し、あなたの Supabase プロジェクトの情報を設定します。

    ```dotenv:.env
    # あなたの Supabase プロジェクト URL を設定してください
    NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
    # あなたの Supabase プロジェクトの Anon Key を設定してください
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

    # --- 注意 ---
    # ここで設定するのは `anon` キーです。`service_role` キーではありません。
    # このファイルは `.gitignore` に含まれているため、Git にコミットされません。
    ```
    *   Supabase プロジェクトの URL と Anon Key は、Supabase ダッシュボードの `Project Settings` > `API` で確認できます。

4.  **開発サーバーを起動:**
    ```bash
    pnpm dev
    # または npm run dev / yarn dev
    ```

5.  **ブラウザでアクセス:**
    [http://localhost:3000](http://localhost:3000) を開きます。 初回アクセス時はログインページ (例: `/en/login`) にリダイレクトされる場合があります。

---

## 使い方

1.  **サインアップ / ログイン:**
    *   初めて利用する場合は、メールアドレスとパスワードでサインアップしてください。
    *   アカウントがある場合はログインします。
2.  **CSV ファイルの準備:**
    *   **1行目をヘッダー行** とした CSV ファイルを用意します (例: `name,email,company`)。ヘッダーがないと正しく処理されません。
    *   文字コードは **UTF-8** を推奨します。
    *   例:
        ```csv
        name,email,company
        田中太郎,tanaka@example.com,株式会社A
        山田花子,yamada@example.com,合同会社B
        ```
3.  **CSV アップロード:**
    *   ログイン後のリスト一覧ページ (`/ja/lists` や `/en/lists` など) にある「CSVファイルをアップロード」セクションでファイルを選択します。
    *   アップロードが完了すると、メッセージが表示され、リスト一覧が自動で更新されます。
4.  **リストの確認:**
    *   アップロードされた CSV ファイル名 (拡張子 `.csv` を除いたもの) がタイトルとなった新しいリストが一覧に追加されます。
    *   リストの ID またはタイトルをクリックすると、リストの詳細ページ (`/ja/lists/<リストID>`) に遷移し、登録されたアイテムを確認できます。

---

## 🛠️ 技術スタック

*   [Next.js](https://nextjs.org/) (App Router)
*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Supabase](https://supabase.com/) (Auth, Database)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [next-intl](https://next-intl-docs.vercel.app/) (国際化)

---

## ☁️ Vercel へのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/4geru/supabase-qr-connector.git&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=supabase-qr-connector-frontend&repository-name=supabase-qr-connector-frontend&root-directory=frontend)

上のボタンをクリックするか、Vercel のダッシュボードから簡単にデプロイできます。

**重要な設定:**

*   **Framework Preset:** `Next.js` を選択してください。
*   **Root Directory:** `frontend` を指定してください。
*   **環境変数:** デプロイ時に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定してください。

---

## 🙌 コントリビュート

フィードバックや貢献は大歓迎です！ 問題を見つけた場合は [Issue](https://github.com/4geru/supabase-qr-connector/issues) を作成したり、改善提案があれば [Pull Request](https://github.com/4geru/supabase-qr-connector/pulls) を送ってください。 (TODO: 正しいリポジトリURLに置き換えてください)
