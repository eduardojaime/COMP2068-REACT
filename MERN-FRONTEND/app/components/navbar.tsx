import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex flex-col md:flex-row md:justify-between md:items-center">
      <h1 className="text-xl font-bold mb-2 md:mb-0">COMP2068 Sushi Menu</h1>
      <ul className="flex flex-col md:flex-row md:space-x-4">
        <li>
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
        </li>
        <li>
          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>
        </li>
        <li>
          <Link href="/sushi" className="hover:text-gray-300">
            Sushi
          </Link>
        </li>
        <li>
          <Link href="/auth/register" className="hover:text-gray-300">
            Register
          </Link>
        </li>
        <li>
          <Link href="/auth/login" className="hover:text-gray-300">
            Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}
