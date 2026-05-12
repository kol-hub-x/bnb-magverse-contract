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
- `BSCSCAN_API_KEY` — from [BscScan API keys](https://bscscan.com/myapikey).

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

## Verification (BscScan)

After deployment, verify the **implementation** contract first (the address labeled “Implementation” in the deploy logs). Replace placeholders with your values.

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
