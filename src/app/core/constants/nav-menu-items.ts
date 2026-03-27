import { NavMenuItem } from "../interfaces/nav-menu-item";

export const SuperAdminSidebarMenuItems: NavMenuItem[] = [
  {
    href: "/super-admin/dashboard",
    title: "Platform Dashboard",
    icon: "pi pi-chart-line",
    position: "top",
  },
  // {
  //   href: "/super-admin/owners",
  //   title: "Owners Management",
  //   icon: "pi pi-users",
  //   position: "top",
  // },
  {
    href: "/super-admin/subscription-plans",
    title: "Subscription Plan Management",
    icon: "pi pi-tag",
    position: "top",
  },
  // {
  //   href: "/audit-logs",
  //   title: "System Audit Logs",
  //   icon: "pi pi-history",
  //   position: "top",
  // },
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
    href: "/owner-dashboard",
    icon: "pi pi-th-large",
    position: "top",
  },
  {
    title: "Billing",
    href: "/billing-management",
    icon: "pi pi-calculator",
    position: "top",
  },
  {
    title: "Inventory",
    href: "/inventory-management",
    icon: "pi pi-box",
    position: "top",
  },
  {
    title: "Transactions",
    href: "#",
    icon: "pi pi-shopping-bag",
    position: "top",
    subItems: [
      {
        title: "Purchases",
        href: "/purchases",
        icon: "pi pi-cart-arrow-down",
      },
      {
        title: "Sales",
        href: "/sales-history",
        icon: "pi pi-history",
      }
    ]
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "pi pi-chart-bar",
    position: "top",
  },
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: "pi pi-cog",
  //   position: "top",
  // },
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
    href: "/inventory-management",
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
    title: "Billing management",
    href: "/sales",
    icon: "pi pi-calculator",
    position: "top",
  },
  {
    title: "Search Medicines",
    href: "/inventory-management",
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
