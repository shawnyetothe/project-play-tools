import Link from "next/link";
import { meta } from "@/lib/data";
import { Rich } from "./RichText";

const locks = ["lock-field", "lock-uri", "lock-script", "lock-dependencies", "lock-param-hooks"];

export function PublishWithAbx({ blurb }: { blurb?: string }) {
  const abx = meta.abx;
  return (
    <section className="abx-block" aria-labelledby="publish-abx">
      <h2 id="publish-abx">Publish with ABX</h2>
      <p className="warning" role="note">
        <strong>Prerelease, not independently audited.</strong> abx.io calls ABX prerelease software, not independently audited. The docs say ABX has not had an independent third-party audit, and that beta networks use real funds and irreversible state while ABX remains pre-1.0. Rehearse on a test network first.
      </p>
      <p>
        <a href="https://abx.io">abx.io</a> is Art Blocks’ own site for ABX. The deploy guide is{" "}
        <a href="https://docs.abx.io/docs/using-abx/guides/deploy-a-digital-asset">Choose a project</a>.
      </p>
      {blurb ? (
        <p>
          <Rich text={blurb} />
        </p>
      ) : null}
      <ol className="steps">
        <li>
          <strong>Test network first.</strong> Base Sepolia is the default testnet. Sepolia is also supported. Base, Ethereum, Arbitrum, and Robinhood Chain are in beta. Gas sponsorship through the email sign-in wallet is only on Base and Base Sepolia.{" "}
          <a href="https://docs.abx.io/docs/reference/deployments">Networks</a>
        </li>
        <li>
          <strong>Install the CLI.</strong> <code>npm install -g @artblocks/abx-cli</code>, then <code>abx skill install</code>. It needs Node 22.13 or newer. Every deploy starts with a dry run.{" "}
          <a href="https://docs.abx.io/docs/using-abx/quickstart">Quickstart</a>
        </li>
        <li>
          <strong>Deploy a whole folder as a numbered series.</strong> <code>abx deploy-series --dir ./art</code> sorts the files into token IDs 0, 1, 2, and so on. Uploads can go to Arweave, IPFS, or cloud storage (<code>--backend arweave|ipfs|cloud</code>).{" "}
          <a href="https://docs.abx.io/docs/using-abx/guides/deploy-a-digital-asset">Deploy a digital asset</a>
          {" · "}
          <a href="https://docs.abx.io/docs/using-abx/guides/storage">Storage</a>
        </li>
        <li>
          <strong>Generate a mint page.</strong> <code>abx mint-page</code> writes a static mint site for the shared minter. A series gets a gallery. The generated page supports ETH sales for now.{" "}
          <a href="https://docs.abx.io/docs/using-abx/guides/sales">Sales and the mint page</a>
        </li>
        <li>
          <strong>Choose what to lock.</strong> Permanent locks: {locks.join(", ")}.{" "}
          <a href="https://docs.abx.io/docs/protocol/metadata">Metadata and locks</a>
        </li>
        <li>
          <strong>Set royalties.</strong> ERC-2981, default 5% (500 bps). The cap defaults to 10% (1000 bps) and can only go down. Optional ERC-721C / ERC-1155C enforcement. Otherwise marketplaces may ignore royalties.{" "}
          <a href="https://docs.abx.io/docs/using-abx/guides/royalty-enforcement">Royalty enforcement</a>
        </li>
        <li>
          <strong>Fixed-price sales ship.</strong> Shared ownerless minters, in ETH or an ERC-20. Proceeds go straight to the primary payee.{" "}
          <a href="https://docs.abx.io/docs/using-abx/guides/sales">Sales</a>
        </li>
        <li>
          <strong>Auctions and allowlists need a custom minter.</strong> They are not shipped. The ABX agent skill knows the mint interfaces.{" "}
          <a href="https://docs.abx.io/docs/protocol/minting">Minting</a>
        </li>
      </ol>
      <h3>Art Blocks Studio, Engine, Flex, and ABX</h3>
      <p className="quiet">From Art Blocks’ and ABX’s own docs, read for these notes on October 25, 2026. Bracket tags stay as written.</p>
      <div className="compare">
        {abx.table.map((row) => (
          <article key={row.job}>
            <h4>{row.job}</h4>
            <p>
              <span className="who">Art Blocks</span> <Rich text={row.artblocks} />
            </p>
            <p>
              <span className="who">ABX</span> <Rich text={row.abx} />
            </p>
          </article>
        ))}
      </div>
      <h3>Sources for the comparison</h3>
      <ul className="link-list">
        {abx.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url}>{source.id}</a>
          </li>
        ))}
        <li>
          <a href="https://www.abx.io/">abx.io</a>
        </li>
        <li>
          <a href="https://github.com/ArtBlocks/abx">GitHub (MIT)</a>
        </li>
        <li>
          <a href="https://x.com/artblocks_io/status/2105359383626445289">Art Blocks on X, September 30, 2026</a>
        </li>
      </ul>
      <p>
        <Link href="/abx/">The full publish, protect, and monetize page</Link>
      </p>
    </section>
  );
}
