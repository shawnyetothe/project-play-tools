import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <h1>That page is not in this guide.</h1>
      <p>
        <Link href="/">Back to Play Tools</Link>
      </p>
    </div>
  );
}
