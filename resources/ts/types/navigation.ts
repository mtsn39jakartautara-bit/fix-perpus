export interface NavItem {
    name: string;
    path: string;
    submenu?: NavItem[];
}

export interface NavbarProps {
    navItems: NavItem[];
}
