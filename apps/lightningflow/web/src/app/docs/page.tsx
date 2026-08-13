import Link from 'next/link';

const resources = [
  ['Dashboard', '/dashboard'],
  ['Payments', '/payments'],
  ['Lightning guides', '/learn/lightning'],
  ['Security', '/security'],
  ['Trust center', '/trust-center'],
] as const;

export default function DocsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold">LightningFlow documentation</h1>
      <p className="mt-4 text-muted-foreground">
        Product, payment, security, and operational resources for LightningFlow.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {resources.map(([label, href]) => (
          <li key={href}>
            <Link className="block rounded-lg border p-5 hover:bg-muted" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
