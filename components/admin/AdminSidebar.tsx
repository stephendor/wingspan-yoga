import Link from 'next/link';

const navLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/classes', label: 'Class Management' },
  { href: '/admin/blog', label: 'Blog Management' },
];

export default function AdminSidebar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return (
    <aside className="w-64 bg-white border-r flex flex-col py-8 px-4">
      <h2 className="text-xl font-bold mb-8">Admin</h2>
      <nav>
        <ul className="space-y-4">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href}>
                <span className={`block px-4 py-2 rounded hover:bg-gray-100 ${pathname === link.href ? 'bg-gray-200 font-semibold' : ''}`}>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
