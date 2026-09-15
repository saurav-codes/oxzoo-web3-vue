# oxzoo-web3-vue

An official ox deploy example: a Vue 3 single-page dApp built with Vite, plus a tiny Express API, deployed to a single Ubuntu VPS by the [ox](https://github.com/saurav-codes/vps-ctl) control plane from one `ox.toml` manifest at the repo root. ox runs `npm install` and `npm run build`, serves `dist/` statically through nginx, and runs `node server.js` as a systemd process bound to `127.0.0.1:9116`, with only `/api` and `/health` proxied to it.

A dApp needs very little on a server: the SPA is static files, the wallet stays client-side (MetaMask injects `window.ethereum` in the visitor's browser; no private key ever reaches the VPS), and the only server-side part is a tiny API that proves the deploy works end to end. The greeting renders without any wallet connected, so headless verification can check the deployment with nothing but curl.

## Stack

| Component | Version | Purpose |
|---|---|---|
| Vue | 3.5.42 | SPA framework, mounts `#app` from `index.html` |
| Vite | 8.3.0 | dev server and production bundler, builds `dist/` |
| @vitejs/plugin-vue | 6.0.9 | Vite plugin compiling `src/App.vue` |
| ethers | 6.17.0 | wallet connection via `BrowserProvider` (ethers v6) |
| Express | 5.2.1 | `GET /api/greeting` and `GET /health`, binds `127.0.0.1:9116` |
| Package manager | npm | lockfile (`package-lock.json`) is committed |
| Deploy | ox | `ox.toml` defines processes, frontend, domain |

## Environment flow

One variable, two paths:

**`GREETING_TAG`**

- **Runtime path (API):** `server.js` reads `process.env.GREETING_TAG` on every request to `/api/greeting` (`hello world oxzoo-web3-vue_` + `GREETING_TAG`). ox injects it from the app's `environment_file` at process start, so a restart with a new value changes the API line without a rebuild.
- **Build-time path (SPA):** `vite.config.js` sets `envPrefix: ["GREETING_", "VITE_"]`, so any `GREETING_*` variable in the build environment is exposed to `import.meta.env`. `src/App.vue` builds the greeting as a single template literal (`hello world oxzoo-web3-vue_${import.meta.env.GREETING_TAG}`), which Vite bakes into the bundle during `npm run build`. Changing the SPA value requires a redeploy.

**`PORT`** is read by `server.js` with `process.env.PORT || 9116`; ox injects it from the platform, and the process command stays `node server.js` with no port in it.

**Set `GREETING_TAG` in the ox Environment editor BEFORE the first deploy.** The SPA value is baked during the deploy build step, so changing it later requires a redeploy; the API value updates as soon as the process restarts. `.env.example` documents the variable with a placeholder; real values live in the ox dashboard, never in git.

## Deploy with ox

1. Add the repo in the ox dashboard: paste the clone URL `https://github.com/saurav-codes/oxzoo-web3-vue`.
2. In the Environment editor, set `GREETING_TAG=w3-02`.
3. Press **Deploy**. ox runs `npm install`, then `npm run build`, starts `node server.js`, and waits for `http://127.0.0.1:9116/health` to return `ok`.

Expect the app at https://web3.oxzoo.sorv.dev.

## Expected output

With `GREETING_TAG=w3-02`, visiting https://web3.oxzoo.sorv.dev shows:

```
oxzoo-web3-vue
hello world oxzoo-web3-vue_w3-02
[Connect Wallet]
```

The same string comes from the API:

```bash
curl https://web3.oxzoo.sorv.dev/api/greeting
# hello world oxzoo-web3-vue_w3-02
```

**The greeting renders without any wallet connected**, so headless verification (curl the API, or load the page with no browser wallet) sees it. The **Connect Wallet** button is additive: it needs MetaMask in a real browser. Without an injected wallet it shows `No injected wallet found — install MetaMask to connect.`; with one, it asks the wallet for the signer address and shows it truncated (`0x1234…abcd`). The app never asks for or stores private keys; only a public address is read after the user approves the connection in the wallet.

## How nginx fits

ox configures nginx with `spa = true`: it serves `dist/` from the current release with `try_files $uri $uri/ /index.html`, so deep links fall back to the SPA entry. Only the `[frontend].api_paths` prefixes `/api` and `/health` are proxied to the web process on `127.0.0.1:9116`; everything else is static files.

## Local development

```bash
npm install
npm run dev                                       # Vite dev server
GREETING_TAG=localtest PORT=9116 node server.js   # API on 127.0.0.1:9116
GREETING_TAG=localtest npm run build              # bakes GREETING_TAG into dist/
npm start                                         # node server.js, for the built API
```

Pass env inline per the commands above; never commit a real `.env`.
