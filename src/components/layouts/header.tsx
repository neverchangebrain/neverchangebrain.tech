import { FloatingNav } from '@/components/ui/floating-navbar';
import { navItems } from '@/constants/nav';

export function Header() {
  return (
    <header className="flex">
      <FloatingNav navItems={navItems} />
    </header>
  );
}
