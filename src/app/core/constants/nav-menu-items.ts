import { NavMenuItem } from "../interfaces/nav-menu-item";

export const SuperAdminSidebarMenuItems: NavMenuItem[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: "pi pi-th-large",
    position: "top",
  },
  {
    href: "/tenants",
    title: "Tenant Management",
    icon: "pi pi-building",
    position: "top",
  },
  {
    href: "/financials",
    title: "Financials & Payment",
    icon: "pi pi-money-bill",
    position: "top",
  },
  {
    href: "/audit-logs",
    title: "Audit Logs",
    icon: "pi pi-list",
    position: "top",
  },
  {
    href: "/account/profile",
    title: "Profile",
    icon: "pi pi-user",
    position: "bottom",
  },
  {
    href: "/logout",
    title: "Logout",
    icon: "pi pi-sign-out",
    position: "bottom",
    clickEvent: "logout",
  },
];

export const AdminSidebarMenuItems: NavMenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "pi pi-th-large",
    position: "top",
  },
  {
    title: "Medical Store Operations",
    href: "#",
    icon: "pi pi-shopping-bag",
    position: "top",
    subItems: [
      {
        title: "Inventory",
        href: "/inventory",
        icon: "pi pi-box",
      },
      {
        title: "Sales & Billing",
        href: "/sales",
        icon: "pi pi-receipt",
      },
      {
        title: "Suppliers",
        href: "/suppliers",
        icon: "pi pi-truck",
      },
    ],
  },
  {
    title: "User Management",
    href: "/users",
    icon: "pi pi-users",
    position: "top",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "pi pi-chart-bar",
    position: "top",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "pi pi-cog",
    position: "top",
  },
  {
    title: "Account Management",
    href: "/account/profile",
    icon: "pi pi-user",
    position: "bottom",
  },
  {
    title: "Logout",
    href: "",
    icon: "pi pi-sign-out",
    position: "bottom",
    clickEvent: "logout",
  },
];

export const StoreManagerSidebarMenuItems: NavMenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "pi pi-th-large",
    position: "top",
  },
  {
    title: "Inventory Management",
    href: "/inventory",
    icon: "pi pi-box",
    position: "top",
  },
  {
    title: "Sales Management",
    href: "/sales",
    icon: "pi pi-receipt",
    position: "top",
  },
  {
    title: "Supplier Relations",
    href: "/suppliers",
    icon: "pi pi-truck",
    position: "top",
  },
  {
    title: "Store Performance",
    href: "/reports",
    icon: "pi pi-chart-line",
    position: "top",
  },
  {
    title: "Account Management",
    href: "/account/profile",
    icon: "pi pi-user",
    position: "bottom",
  },
  {
    title: "Logout",
    href: "",
    icon: "pi pi-sign-out",
    position: "bottom",
    clickEvent: "logout",
  },
];

export const StoreStaffSidebarMenuItems: NavMenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "pi pi-th-large",
    position: "top",
  },
  {
    title: "Billing & Pos",
    href: "/sales",
    icon: "pi pi-calculator",
    position: "top",
  },
  {
    title: "Search Medicines",
    href: "/inventory",
    icon: "pi pi-search",
    position: "top",
  },
  {
    title: "Patient Records",
    href: "/patients",
    icon: "pi pi-users",
    position: "top",
  },
  {
    title: "Profile",
    href: "/account/profile",
    icon: "pi pi-user",
    position: "bottom",
  },
  {
    title: "Logout",
    href: "",
    icon: "pi pi-sign-out",
    position: "bottom",
    clickEvent: "logout",
  },
];
