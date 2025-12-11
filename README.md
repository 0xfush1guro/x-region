# X Account Region Checker

This tool checks the region of X (Twitter) accounts using their username.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Configure environment variables:
    *   Create a `.env` file in the root directory (if it doesn't exist).
    *   You need to add your X (Twitter) authentication cookies: `AUTH_TOKEN` and `CT0`.

## How to get `AUTH_TOKEN` and `CT0`

You can obtain these values from your browser after logging into X (Twitter). The easiest way is using a browser extension.

### Using "Cookie-Editor" Extension

1.  **Install the Extension:**
    *   **Chrome:** [Cookie-Editor on Chrome Web Store](https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm)
    *   **Firefox:** [Cookie-Editor on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/)
    *   (Or search for "Cookie Editor" in your browser's extension store).

2.  **Login to X:**
    *   Go to [x.com](https://x.com) and log in to your account.

3.  **Get the Cookies:**
    *   Click on the **Cookie-Editor** icon in your browser toolbar.
    *   Look for the cookie named `auth_token`.
        *   Click on it, copy the **Value**, and paste it into your `.env` file as `AUTH_TOKEN`.
    *   Look for the cookie named `ct0`.
        *   Click on it, copy the **Value**, and paste it into your `.env` file as `CT0`.

### Example `.env` file

```ini
AUTH_TOKEN=your_auth_token_here
CT0=your_ct0_here
```

## Usage

Run the script:

```bash
node index.js
```

Follow the menu prompts to check a single username or import from `data/accounts.csv`.
