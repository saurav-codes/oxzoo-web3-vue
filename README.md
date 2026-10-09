# oxzoo-web3-vue

Deployed with [ox](https://deploywithox.com): deploy a repo to your own server with one command, no Docker. [Docs](https://deploywithox.com/docs) · [Guide for this stack](https://deploywithox.com/docs/guides/vue)

An [ox](https://deploywithox.com) deploy example: a Vue 3 single-page dApp built with Vite, plus a tiny Express API, deployed to your own Ubuntu server. systemd runs Express, and Caddy serves the built SPA with an `index.html` fallback while sending only `/api` and `/health` to Express.

A dApp needs very little on a server: the SPA is static files, the wallet stays client-side (MetaMask injects `window.ethereum` in the visitor's browser; no private key ever reaches the server), and the only server-side part is a tiny API that proves the deploy works end to end. The greeting renders without any wallet connected, so the deploy can be checked with nothing but curl.

## Stack

| Component | Version | Purpose |
|---|---|---|
| Vue | 3.5.42 | SPA framework |
| Vite | 8.3.0 | bundler, builds `dist/` |
| ethers | 6.17.0 | wallet connection via `BrowserProvider` |
| Express | 5.2.1 | `GET /api/greeting` and `GET /health` |
| Runtime | Node.js 24 | ox's default; mise installs it |

## ox.toml

```toml
# Express API + Vue 3 dApp SPA with npm. The wallet stays in the browser.

[app]
health = "/health"

[static]
dir = "dist"
spa = true
api = ["/api", "/health"]
```

ox detects `npm ci` from `package-lock.json`, and `npm run build` and `npm run start` (`node server.js`) from `package.json`.

## Environment flow

1. **Run time (API):** `server.js` reads `process.env.GREETING_TAG` on every `GET /api/greeting`.
2. **Build time (SPA):** `vite.config.js` sets `envPrefix: ["GREETING_", "VITE_"]`, so `src/App.vue` reads `import.meta.env.GREETING_TAG` and Vite bakes it into `dist/`.

ox sets your variables before the build, and changing one with `ox vars set` redeploys, which rebuilds the SPA.

## Deploy with ox

```sh
curl -fsSL https://deploywithox.com/install.sh | sh
ox login
ox new https://github.com/saurav-codes/oxzoo-web3-vue
printf 'GREETING_TAG=demo\n' | ox review oxzoo-web3-vue --from-file - --wait
```

The plan, offline:

```console
$ ox check .
ox check . (manifest: ox.toml)

  app.start                  npm run start                                        detected:package.json
  app.health                 /health                                              declared
  static.dir                 dist                                                 declared
  static.spa                 true                                                 declared
  static.api                 /api, /health                                        declared
  build.install              npm ci                                               detected:package-lock.json
  build.commands[0]          npm run build                                        detected:package.json
  tools.node                 24                                                   default

  Provided by ox: PORT, HOST, OX_ENV, OX_PROJECT, OX_RELEASE, OX_DATA_DIR, PUBLIC_URL, PUBLIC_HOST
  Set on the dashboard before the first deploy: GREETING_TAG

Ready to deploy.
```

## Expected output

```
oxzoo-web3-vue
hello world oxzoo-web3-vue_<GREETING_TAG>
[Connect Wallet]
```

`GET /api/greeting` returns the same line. The **Connect Wallet** button needs MetaMask in a real browser. Without an injected wallet it says so; with one, it asks the wallet for the signer address and shows it truncated. The app never asks for or stores private keys.

## Local development

```sh
npm ci
GREETING_TAG=localtest npm run build
GREETING_TAG=localtest PORT=9116 node server.js
```
