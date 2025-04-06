# Supabase QR Connector - Frontend

<img src="[Insert attractive screenshot or GIF here]" alt="App Screenshot" width="600">

**Just upload a CSV, and your data instantly becomes a usable list in Supabase! ✨**

This is the frontend application for Supabase QR Connector. With this app, you can incredibly easily import your CSV files into your Supabase project and create manageable lists. No more tedious manual input or complex API integrations!

**Recommended for you if:**

*   📈 You use Supabase and want an easier way to register data.
*   📄 You want to quickly handle CSV data in a web application.
*   ⏳ You want to save time on data entry and focus on development or analysis.
*   💡 You want to implement new ideas using Supabase, such as QR code integration (連携 with backend features).

---

## ✨ Key Features

*   **🚀 Easy CSV Upload:** Upload CSV files with a drag-and-drop feel.
*   **📄 Automatic List Creation:** Automatically creates lists and items in Supabase based on the uploaded CSV.
*   **🔐 Secure Authentication:** Secure user authentication via Supabase Auth. Your data is protected.
*   **🌐 Multilingual Support:** Supports English and Japanese (other languages can be added).
*   **📱 Responsive Design:** Operates comfortably on both desktop and mobile.

---

## 🚀 Get Started! (Setup)

### Prerequisites

*   [Node.js](https://nodejs.org/) (Version 18.x or higher recommended)
*   [pnpm](https://pnpm.io/) (or npm/yarn)
*   A [Supabase Project](https://supabase.com/)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/4geru/supabase-qr-connector.git
    cd supabase-qr-connector/frontend
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    # or npm install / yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the `frontend` directory and configure your Supabase project information.

    ```dotenv:.env
    # Set your Supabase project URL
    NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
    # Set your Supabase project Anon Key
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

    # --- Note ---
    # Set the `anon` key here, not the `service_role` key.
    # This file is included in `.gitignore` and will not be committed to Git.
    ```
    *   You can find your Supabase project URL and Anon Key in the Supabase dashboard under `Project Settings` > `API`.

4.  **Start the development server:**
    ```bash
    pnpm dev
    # or npm run dev / yarn dev
    ```

5.  **Access in browser:**
    Open [http://localhost:3000](http://localhost:3000). You might be redirected to the login page (e.g., `/en/login`) on your first visit.

---

## How to Use

1.  **Sign Up / Log In:**
    *   If you're using it for the first time, sign up with your email and password.
    *   If you have an account, log in.
2.  **Prepare your CSV file:**
    *   Prepare a CSV file with the **first row as the header** (e.g., `name,email,company`). It won't process correctly without a header.
    *   **UTF-8** encoding is recommended.
    *   Example:
        ```csv
        name,email,company
        Taro Tanaka,tanaka@example.com,Company A Inc.
        Hanako Yamada,yamada@example.com,Company B LLC
        ```
3.  **Upload CSV:**
    *   Select the file in the "Upload CSV file" section on the list page after logging in (e.g., `/ja/lists` or `/en/lists`).
    *   Once the upload is complete, a message will appear, and the list will update automatically.
4.  **Check the List:**
    *   A new list titled with the uploaded CSV filename (excluding the `.csv` extension) will be added to the list.
    *   Click the list ID or title to navigate to the list details page (`/en/lists/<list_id>`) and view the registered items.

---

## 🛠️ Tech Stack

*   [Next.js](https://nextjs.org/) (App Router)
*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Supabase](https://supabase.com/) (Auth, Database)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [next-intl](https://next-intl-docs.vercel.app/) (Internationalization)

---

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/4geru/supabase-qr-connector.git&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=supabase-qr-connector-frontend&repository-name=supabase-qr-connector-frontend&root-directory=frontend)

Click the button above or deploy easily from the Vercel dashboard.

**Important Settings:**

*   **Framework Preset:** Select `Next.js`.
*   **Root Directory:** Specify `frontend`.
*   **Environment Variables:** Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` during deployment.

---

## 🙌 Contributing

Feedback and contributions are welcome! If you find an issue, please create an [Issue](https://github.com/4geru/supabase-qr-connector/issues). If you have suggestions for improvement, please send a [Pull Request](https://github.com/4geru/supabase-qr-connector/pulls). (TODO: Replace with the correct repository URL)
