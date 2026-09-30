"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="page-section route-state" role="alert"><p className="eyebrow">something went wrong</p><h1>We couldn&apos;t load this page.</h1><p>Please try again. If the problem continues, contact the site owner.</p><button className="button button-primary" onClick={() => reset()}>try again</button></div>;
}
