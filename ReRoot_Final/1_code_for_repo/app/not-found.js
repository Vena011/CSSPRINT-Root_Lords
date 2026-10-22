import Image from "next/image";
import Link from "next/link";

// 404 page
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Image src="/logo-mark.svg" alt="ReRoot" width={72} height={72} />
      <p className="text-5xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-extrabold">Page not found · Walang ganitong page</h1>
      <p className="max-w-sm text-[15px] text-muted">The link may be old or mistyped, or the dish already sold out.</p>
      <Link href="/" className="inline-flex h-[52px] w-full max-w-xs items-center justify-center rounded-control bg-primary px-5 font-bold text-white hover:bg-primary-dark">
        Back to home
      </Link>
    </main>
  );
}
