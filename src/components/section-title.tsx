export function SectionTitle({ children, eyebrow = "" }: { children: React.ReactNode; eyebrow?: string }) {
  return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{children}</h2></div>;
}