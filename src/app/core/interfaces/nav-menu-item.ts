export interface NavMenuItem {
    title: string;
    href: string;
    icon?: string;
    url?: string;
    subItems?: NavMenuItem[];
    disabled?: boolean;
    divider?: boolean;
    roles?: string[];
    permissions?: string[];
    position?: "top" | "bottom";
    clickEvent?: string;
}
