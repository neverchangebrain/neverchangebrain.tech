export type NavItem = {
  name: string;
  link: string;
  icon?: JSX.Element;
};

export const navItems: NavItem[] = [
  { name: 'Home', link: '/' },
  { name: 'Work', link: '/work' },
  { name: 'Channel', link: '/channel' },
];
