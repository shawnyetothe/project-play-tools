# ABX notes (researched Oct 25, 2026 ET)

## What ABX is (confirmed)
ABX is **Art Blocks' open protocol and toolkit**. Every point below comes from Art Blocks' own sources.

- **What it does.** ABX is "an open-source protocol and toolkit for putting digital objects on the blockchain". [sourced: https://www.abx.io/ (agent view https://abx.io/?view=agent), https://docs.abx.io/llms.txt]
- **Who runs it.** It is "Maintained by the team at Art Blocks" / "Built by the team at Art Blocks". [sourced: abx.io]
- **License.** The repo is https://github.com/ArtBlocks/abx, MIT license, created 2026-09-09 UTC. Its repo description reads "Open protocol and toolkit for creating, operating, and serving NFTs". [sourced: GitHub API]
- **Announcement.** Art Blocks announced ABX on X on Sep 30, 2026: https://x.com/artblocks_io/status/2105359383626445289. The announcement also says the curated flagship artblocks.io continues with its existing standards. [sourced: X post, read earlier in this task]
- **Status.** abx.io calls it "prerelease software, not independently audited". The docs say: "ABX has not had an independent third-party audit." and "Beta networks use real funds and irreversible state while ABX remains pre-1.0." [sourced: abx.io; https://docs.abx.io/docs/reference/deployments]
- **Toolkit.**
  - A CLI: `npm install -g @artblocks/abx-cli`, then `abx skill install`. It needs Node 22.13+.
  - An agent skill, which supports Claude Code, Cursor, Codex, Gemini and Copilot.
  - An SDK.
  - Every deploy starts with a dry run.
  - [sourced: abx.io; https://docs.abx.io/docs/using-abx/quickstart]
- **Networks.**
  - Base Sepolia is the default testnet.
  - Sepolia is supported.
  - Base, Ethereum, Arbitrum and Robinhood Chain are in "Beta" production.
  - Gas sponsorship through the email sign-in creator wallet is available only on Base and Base Sepolia.
  - [sourced: https://docs.abx.io/docs/reference/deployments, https://docs.abx.io/docs/using-abx/creator-wallet]
- **Optional services.**
  - Hosting, metadata and preview rendering, with email sign-in. abx.io notes that "Covered test fees may be limited".
  - You can leave any time with `abx migrate`, or self-host.
  - [sourced: abx.io; https://docs.abx.io/docs/using-abx/self-hosting]

## The three jobs: ABX vs Art Blocks Studio / Engine / Flex

| Job | Art Blocks (Studio / Engine / Flex) | ABX |
|---|---|---|
| **Publish:** who | Studio requires an application, with about 10% accepted. Accepted artists then self-serve in the Creator Dashboard. Engine and Engine Flex are white-label for partner platforms. [offerings, what-is-engine] | Anyone, with no application. [abx.io, quickstart] |
| **Publish:** shapes | Long-form generative code projects (ERC-721) on the V3 core. [core-contract] | 1/1, series, or code project (program or on-chain renderer) as ERC-721; editions as ERC-1155 (`--copies`). [deploy-a-digital-asset] |
| **Protect:** storage | Scripts are stored on-chain, and libraries come from the on-chain Dependency Registry. Flex adds IPFS, Arweave, BytecodeStorage and PostParams. [on-chain-storage, flex-assets] | On-chain (chunked byte storage), Arweave, IPFS, S3/R2 or local. Each metadata field can be on-chain, computed, hash-committed or off-chain. [storage, onchain-storage, metadata] |
| **Protect:** provenance | The V3 core is open source. Transfer hooks (Engine v3.3.0+, Flex v3.3.1+) can record provenance or set transfer conditions. [core-contract, transfer-hooks] | Each project gets its own contract from ownerless factories. `abx verify` checks for a canonical ABX contract. [abx.io, cli] |
| **Protect:** ownership | Engine partners own and control their contracts. Studio comes with a V3 Engine core deployment. [what-is-engine, offerings] | There is "no protocol administrator". The owner controls settings until they lock them, and can transfer or renounce ownership. [owner-powers] |
| **Protect:** freezing | Not covered in the pages we read (gap). | Locks: lock-field, lock-uri, lock-script, lock-dependencies, lock-param-hooks. [metadata, cli] |
| **Protect:** royalties | ERC-2981 via a 0xSplits splitter, plus the Royalty Registry. Studio secondary royalties are up to 5%, split 2/3 artist and 1/3 Art Blocks by default. [core-contract] | ERC-2981, default 500 bps. The cap defaults to 1000 bps and can only fall. Optional ERC-721C / ERC-1155C enforcement; otherwise marketplaces may ignore royalties. [royalty-enforcement, cli] |
| **Monetize:** primary | The Minter Suite: set price, Dutch auctions (with or without settlement), allowlists, RAM, SEA. [minters] | Shared ownerless fixed-price minters, in ETH or ERC-20. Proceeds go straight to the primary payee. [minting, sales] |
| **Monetize:** auctions and allowlists | Built in. [minters] | Not shipped: they need a custom minter contract. [minting] |
| **Monetize:** editions | Unique long-form outputs; the artist sets edition size. [offerings] | ERC-1155 with per-ID caps and per-ID prices. [sales] |
| **Monetize:** split and fees | Studio primary sales split 90% artist and 10% Art Blocks. [core-contract] | No fee schedule found in the docs (gap). |
| **Monetize:** mint page | Listed on artblocks.io. [offerings] | `abx mint-page` scaffolds a static site (ETH only for now). [sales] |
| **Evolve** | PostParams (Flex v3.2.5+). [postparams] | Typed parameters (authority Creator / TokenOwner / Address; `lockAfter` deadlines), plus configure, transfer and augment hooks. [params, custom-mechanics] |

Link key for the table:
- Art Blocks:
  - offerings = https://docs.artblocks.io/creator-onboarding/offerings/
  - what-is-engine = https://docs.artblocks.io/creator-onboarding/engine-partners/what-is-engine/
  - core-contract = https://docs.artblocks.io/developer/core-contract/
  - on-chain-storage = https://docs.artblocks.io/protocol/on-chain-storage/
  - flex-assets = https://docs.artblocks.io/creator-onboarding/artists/flex-assets/
  - transfer-hooks = https://docs.artblocks.io/protocol/transfer-hooks/
  - minters = https://docs.artblocks.io/creator-onboarding/artists/minters/
  - postparams = https://docs.artblocks.io/protocol/postparams/
- ABX: every page is https://docs.abx.io/docs/ followed by its path:
  - using-abx/guides/deploy-a-digital-asset
  - using-abx/guides/storage
  - protocol/onchain-storage
  - protocol/metadata
  - reference/cli
  - protocol/owner-powers
  - using-abx/guides/royalty-enforcement
  - protocol/minting
  - using-abx/guides/sales
  - protocol/params
  - using-abx/guides/custom-mechanics

## How the emergent tools plug in
None of ERC-8048, 721T, ERC-6551, ERC-8004, ERC-8217 or ERC-7160 appears in the ABX docs or in the Art Blocks docs we read. Every mapping below is our inference unless it is tagged [sourced].

- **ERC-8048 (redemption or evolving state).**
  - Today, the same per-token state fits in Art Blocks PostParams [sourced feature] or ABX typed parameters and field renderers [sourced feature].
  - Native ERC-8048 would need a contract that implements `metadata(tokenId,key)` and `MetadataSet` [spec]; neither platform documents that.
- **721T.** It needs an ERC-8048 contract [spec: https://github.com/nxt3d/721t]. It is not documented on either platform.
- **ERC-6551.**
  - The spec says it works with existing ERC-721s without contract changes [sourced: https://eips.ethereum.org/EIPS/eip-6551].
  - ABX series and code projects are ERC-721 [sourced], and so are Art Blocks tokens.
  - So both could get token-bound accounts [our inference].
- **ERC-8217.** It binds existing NFTs to ERC-8004 agents without changing the collection [spec], so the platform does not matter [our inference].
- **IPFS / Arweave and fully on-chain.** Both are [sourced] on both platforms; see the table.

## Uncertainties
- **Status.** ABX is prerelease and pre-1.0, with no third-party audit, and its production networks are in beta.
- **Fees.** No ABX fee schedule was found, and hosted-service sponsorship "may be limited".
- **Sales.** ABX ships only fixed-price sales. Auctions and allowlists need custom contracts.
- **Art Blocks gap.** The Art Blocks pages we read do not describe script freezing or locking.
- **Launch details.** The Sep 30 date and the line about the flagship continuing come from the @artblocks_io X post. We did not use an artblocks.io blog post as a source.
