# BNB Smart Chain — UUPS Upgradeable Contracts

Production-oriented Hardhat repository for **BNB Smart Chain (BSC)** using the **Universal Upgradeable Proxy Standard (UUPS)**. The reference contract `BscEnrollment` demonstrates upgradeable patterns aligned with common **DappBay** expectations: OpenZeppelin upgradeable modules, explicit initializer wiring, pausable user actions, two-step ownership, and documented deployment and verification flows.

## Tech stack

| Area | Choice |
|------|--------|
| Runtime / tooling | [Hardhat](https://hardhat.org/) (JavaScript; **`scripts/` use ESM** via `"type": "module"`; config is `hardhat.config.cjs` per [Hardhat HH19](https://v2.hardhat.org/HH19)) |
| Language | Solidity **^0.8.22** (required by OpenZeppelin UUPS v5.x), compiler **0.8.28**, EVM **`shanghai`** |
| Upgrade pattern | **UUPS** ([ERC-1822](https://eips.ethereum.org/EIPS/eip-1822) proxy + logic split) |
| Libraries | `@openzeppelin/contracts-upgradeable` **v5.x**, `@openzeppelin/hardhat-upgrades` |
| Networks | `bscTestnet` (chainId **97**), `bscMainnet` (chainId **56**) |

## Project layout

- `contracts/BscEnrollment.sol` — UUPS logic: `version`, `enroll()`, events, `Pausable` / `Ownable2Step`, `_authorizeUpgrade` gated by `onlyOwner`.
- `scripts/deploy.js` — deploys a **UUPS (ERC1967) proxy** and its implementation via the OpenZeppelin upgrades plugin, then prints **implementation** and **proxy** addresses.
- `hardhat.config.cjs` — Solidity settings, BSC networks, BscScan verification helpers (CommonJS filename required when `package.json` sets `"type": "module"`).
- `.env.example` — template for secrets and RPC (never commit `.env`).

## Installation

Prerequisites: **Node.js 20+** (LTS recommended; Hardhat v2.26+ targets Node 20) and **npm**.

```bash
cd /path/to/bnb-magverse-contract
npm install
cp .env.example .env
```

Edit `.env` (never commit real keys):

- `PRIVATE_KEY` — deployer private key.
- `BSC_TESTNET_RPC_URL` — JSON-RPC for BSC testnet deploys.
- `BSC_MAINNET_RPC_URL` — JSON-RPC for BSC mainnet deploys.
- `ETHERSCAN_API_KEY` — multichain key from [Etherscan API dashboard](https://etherscan.io/apidashboard), required for `hardhat verify` (uses [Etherscan API v2](https://docs.etherscan.io/v2-migration) with `chainid`; a **single string** `apiKey` in config — do not use a per-network key object or verification falls back to deprecated explorer V1 URLs).

Sourcify is enabled in `hardhat.config.cjs` as an additional verification path (no key).

Compile:

```bash
npx hardhat compile
```

## Deployment

Set the matching RPC variable for your target chain, then run one of:

**BSC Testnet**

```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

**BSC Mainnet**

```bash
npx hardhat run scripts/deploy.js --network bscMainnet
```

The script prints:

- **Implementation (logic)** — the UUPS implementation contract.
- **Proxy (user-facing)** — the address users and dApps should call (`enroll`, `owner`, etc. delegate here).

Optional: set `INITIAL_VERSION` in `.env` before deploy to override the default `1.0.0` passed to `initialize(address,string)`.

## Verification (Etherscan v2 + BscScan UI)

After deployment, verify the **implementation** contract first (the address labeled “Implementation” in the deploy logs). Replace placeholders with your values.

Ensure `.env` has **`ETHERSCAN_API_KEY`** (Etherscan multichain key). Hardhat `2.1.3+` `@nomicfoundation/hardhat-verify` uses `https://api.etherscan.io/v2/api` with `chainid` when `etherscan.apiKey` is a **string**; using an **object** of per-explorer keys forces legacy `https://api-testnet.bscscan.com/api` style calls, which BscScan now rejects as deprecated V1.

If `api.etherscan.io` times out from your network, try `NODE_OPTIONS=--dns-result-order=ipv4first`, a different network/VPN, or verify from CI; Sourcify may also succeed with `sourcify.enabled: true`.

When Sourcify reports **already verified** / **full_match**, your implementation bytecode is already publicly reproducible on [Sourcify repo](https://repo.sourcify.dev/) even if Etherscan times out. For a clean CLI exit without hitting Etherscan, either:

- run only Sourcify: `npx hardhat verify:sourcify --network bscTestnet <IMPLEMENTATION_ADDRESS>`, or  
- set `DISABLE_ETHERSCAN_VERIFY=true` in `.env` and run `npx hardhat verify --network bscTestnet <IMPLEMENTATION_ADDRESS>` (skips Etherscan subtask; Sourcify still runs).

BscScan’s in-page “Verified” badge may still require a successful Etherscan-route submission or their UI import flow when your network can reach `api.etherscan.io`.

**Testnet**

```bash
npx hardhat verify --network bscTestnet <IMPLEMENTATION_ADDRESS>
```

**Mainnet**

```bash
npx hardhat verify --network bscMainnet <IMPLEMENTATION_ADDRESS>
```

Proxies are verified separately on BscScan (proxy tab / “Verify as proxy”) if you need the UI to show the correct ABI; the canonical pattern is: users interact with the **proxy** address, while verification highlights the **implementation** source.

## Security notes

- **Keys**: Only use `PRIVATE_KEY` via `.env` or CI secrets—never embed keys in repo files.
- **Upgrades**: Only the **owner** may upgrade (`_authorizeUpgrade` + `onlyOwner`). Prefer a multisig for production ownership.
- **Ownership transfer**: `Ownable2StepUpgradeable` requires the pending owner to **accept** ownership—reduces mistaken transfers.
- **Pausing**: While paused, `enroll` reverts; owner can `pause` / `unpause` for incident response.

## License

SPDX-License-Identifier: MIT (see contract file headers).
