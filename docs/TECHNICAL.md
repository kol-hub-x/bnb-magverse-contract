# BscEnrollment — Technical integration sheet

This document is for **backend / frontend / DevOps** handoff. Keep it updated after each **redeploy or upgrade**.

---

## 1. Contract addresses

### BSC Testnet (chainId `97`)

| Role | Address |
|------|---------|
| **Proxy (frontend & dApp call target)** | `0x69e2b5bC6f43Cb7C5B7C7ae2225Fb10037e557e3` |
| **Implementation (logic; upgrades target this)** | `0xdFB6C2A1C3504E2E114AD99093caFD6665496B8D` |

Source: deployment log (`scripts/deploy.js` on `bscTestnet`).

### BSC Mainnet (chainId `56`)

| Role | Address |
|------|---------|
| **Mainnet Proxy (frontend interaction address)** | _Not deployed yet — fill after `hardhat run ... --network bscMainnet`_ |
| **Mainnet Implementation** | _Fill from deploy log after mainnet deploy_ |

---

## 2. ABI (for frontend / SDK)

- **Canonical file (version-controlled):** [`abi/BscEnrollment.json`](./abi/BscEnrollment.json)  
  Contains the **`BscEnrollment` logic ABI**. With a **UUPS proxy**, you **instantiate the contract at the Proxy address** but use this **implementation ABI** (standard `ethers` / `viem` pattern: delegatecall to implementation).

- **Regenerate after contract changes:**

  ```bash
  npx hardhat compile
  ```

  Then refresh `docs/abi/BscEnrollment.json` (re-export from `artifacts/contracts/BscEnrollment.sol/BscEnrollment.json` or your internal script).

> **Note:** BscScan “Contract” tab ABI appears after explorer verification; Sourcify full_match proves source↔bytecode alignment but does not replace storing ABI in-repo for CI and frontend codegen.

---

## 3. Bytecode hash (runtime) — build reproducibility

Used to compare **local build** vs **on-chain implementation** runtime code (same compiler + settings required).

| Field | Value |
|-------|--------|
| **Contract** | `BscEnrollment` (implementation) |
| **Keccak256(`deployedBytecode`)** | `0x97521caa033ea64b23f9ea492e866f8ba0aa12ada2d523fec97cd125a92b4183` |

**Recompute locally** (must match `hardhat.config.cjs` Solidity version / optimizer / `evmVersion`):

```bash
npx hardhat compile
node -e "const {keccak256}=require('ethers');const j=require('./artifacts/contracts/BscEnrollment.sol/BscEnrollment.json');console.log(keccak256(j.deployedBytecode));"
```

Run from **repository root** (same directory as `hardhat.config.cjs`).

**On-chain check (conceptual):** fetch implementation address bytecode via RPC, normalize to `0x` hex, `keccak256` it, compare to the table above (after any upgrade, bytecode changes — update this doc).

---

## 4. Build parameters (for audits & reproducible builds)

From `hardhat.config.cjs` at doc generation time:

| Setting | Value |
|---------|--------|
| Solidity | `0.8.28` |
| `evmVersion` | `shanghai` |
| Optimizer | enabled, `runs: 200` |

---

## 5. Frontend integration hints

1. **Read / write:** always use **Proxy address** (testnet row above; mainnet when deployed).
2. **ABI:** use [`docs/abi/BscEnrollment.json`](./abi/BscEnrollment.json) `abi` array.
3. **Owner / upgrades:** `owner`, `transferOwnership`, `acceptOwnership`, `upgradeToAndCall` (UUPS) appear in the same ABI; restrict admin UI to privileged keys only.

---

## 6. Verification status (reference)

| Network | Implementation | Notes |
|---------|----------------|--------|
| BSC Testnet | `0xdFB6C2A1C3504E2E114AD99093caFD6665496B8D` | Sourcify **full_match**: `https://repo.sourcify.dev/contracts/full_match/97/0xdFB6C2A1C3504E2E114AD99093caFD6665496B8D/` |
| BSC Mainnet | — | Update after deploy + verify |

If `api.etherscan.io` is unreachable from your network, see `README.md` (`DISABLE_ETHERSCAN_VERIFY`, `verify:sourcify`, CI verify).

---

## Changelog

| Date (UTC) | Change |
|------------|--------|
| 2026-05-12 | Initial sheet: testnet proxy/impl, ABI export, runtime bytecode keccak |
