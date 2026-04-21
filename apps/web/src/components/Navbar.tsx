import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="text-xl font-bold">Commate</div>
      <ul className="flex gap-4">
        <li><Link href="/" className="hover:underline">Home</Link></li>
        <li><Link href="/about" className="hover:underline">About</Link></li>
      </ul>
    </nav>
  );
}