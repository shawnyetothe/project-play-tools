"use client";

export function KeepForever({
  filename,
  onDownload,
}: {
  filename: string;
  onDownload: () => void;
}) {
  return (
    <section className="keep-forever" id="keep" data-testid="keep-forever" aria-labelledby="keep-title">
      <h2 id="keep-title">Keep it forever</h2>
      <p>Save this piece as one file on your device. The seed, the drawing, and a pen path or picture are inside it. Opening the file does not use the network.</p>
      <button type="button" data-testid="download-one-file" onClick={onDownload}>
        Download as one file
      </button>
      <p className="keep-name">{filename}</p>
      <div className="keep-chain">
        <h3>Put it on chain with ABX FS</h3>
        <ol className="keep-steps">
          <li>Download your file.</li>
          <li>Open fs.abx.io.</li>
          <li>Drop it in.</li>
        </ol>
        <p className="keep-warn">
          ABX FS says it is early, unaudited software and may have bugs. What you publish is public and permanent. On production chains, real funds are at risk. Try a testnet first.
        </p>
        <p className="keep-links">
          <a href="https://fs.abx.io">fs.abx.io</a>
          <a href="https://docs.fs.abx.io">docs.fs.abx.io</a>
          <a href="https://docs.abx.io/docs/using-abx/guides/utilities">ABX utilities</a>
        </p>
        <p className="abx-credit">
          <a href="https://www.artblocks.io">Powered by ABX · inspired by Art Blocks</a>
        </p>
      </div>
    </section>
  );
}
