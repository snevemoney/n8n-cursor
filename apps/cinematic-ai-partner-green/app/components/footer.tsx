export function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} AI Partner. Preview build — not a
          production deployment.
        </p>
      </div>
    </footer>
  );
}
