/**
 * Role-based Access Control Configuration
 * Defines permissions and access levels for different user roles
 */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
};

/**
 * Permission definitions for each role
 */
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
  VIEW_ANALYTICS: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  
  // Products
  VIEW_PRODUCTS: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  CREATE_PRODUCT: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  EDIT_PRODUCT: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  DELETE_PRODUCT: [USER_ROLES.ADMIN],
  
  // Stock/Inventory
  VIEW_STOCK: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
  EDIT_STOCK: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  
  // Operations (Receipts, Deliveries, Transfers)
  VIEW_OPERATIONS: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
  CREATE_OPERATION: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
  VALIDATE_OPERATION: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  CANCEL_OPERATION: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  
  // Move History/Ledger
  VIEW_HISTORY: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  VIEW_OWN_HISTORY: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
  
  // Business Partners
  VIEW_PARTNERS: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  MANAGE_PARTNERS: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  
  // Users
  VIEW_USERS: [USER_ROLES.ADMIN],
  MANAGE_USERS: [USER_ROLES.ADMIN],
  
  // Reports
  VIEW_REPORTS: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  EXPORT_DATA: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  
  // Settings
  VIEW_SETTINGS: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  MANAGE_SETTINGS: [USER_ROLES.ADMIN],
};

/**
 * Check if user has permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
};

/**
 * Check if user has any of the specified roles
 * @param {string} userRole - User's role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export const hasRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Get user's role display name
 * @param {string} role - User role
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.MANAGER]: 'Inventory Manager',
    [USER_ROLES.STAFF]: 'Warehouse Staff',
  };
  return roleNames[role] || role;
};

/**
 * Navigation items configuration with role-based access
 */
export const NAVIGATION_CONFIG = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
    badge: null,
  },
  {
    name: 'Products',
    href: '/products',
    icon: 'Package',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    badge: null,
  },
  {
    name: 'Stock',
    href: '/inventory/stock-levels',
    icon: 'BarChart3',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
    badge: 'popular',
  },
  {
    name: 'Operations',
    icon: 'ArrowLeftRight',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
    children: [
      {
        name: 'Receipts',
        href: '/operations/receipts',
        icon: 'TrendingUp',
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
      },
      {
        name: 'Deliveries',
        href: '/operations/deliveries',
        icon: 'TrendingDown',
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
      },
      {
        name: 'Transfers',
        href: '/operations/transfers',
        icon: 'ArrowLeftRight',
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF],
      },
    ],
  },
  {
    name: 'Move History',
    href: '/inventory/ledger',
    icon: 'History',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    badge: null,
  },
  {
    name: 'Partners',
    href: '/partners',
    icon: 'Users',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    badge: null,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: 'FileText',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    badge: null,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    badge: null,
  },
];

/**
 * Filter navigation items based on user role
 * @param {Array} navItems - Navigation items
 * @param {string} userRole - User's role
 * @returns {Array} Filtered navigation items
 */
export const filterNavigationByRole = (navItems, userRole) => {
  return navItems
    .filter(item => !item.roles || item.roles.includes(userRole))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => 
            !child.roles || child.roles.includes(userRole)
          ),
        };
      }
      return item;
    })
    .filter(item => !item.children || item.children.length > 0);
};

