import Link from "next/link";

export default function NotFound() {
  return <div className="page-section route-state"><p className="eyebrow">404</p><h1>Page not found.</h1><p>This page may have moved or is no longer published.</p><Link className="button button-primary" href="/">return home</Link></div>;
}
