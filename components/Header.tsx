import Link from "next/link"

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 py-6">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-6">

        <Link href="/" className="text-lg font-medium">
          Mitchell Gilbert Messina
        </Link>

        <nav className="flex gap-6 text-sm">
          <Link href="/projects">Projects</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/archive">Archive</Link>
        </nav>

      </div>
    </header>
  )
}