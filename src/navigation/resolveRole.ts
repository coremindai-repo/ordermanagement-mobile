import type { Role } from "../api/types";

/**
 * Users can hold more than one role (contract §4: "mine=true ... unless they hold a
 * supervisory role too"). The wireframes only show one dashboard at a time, so a
 * multi-role user gets the highest-privilege tab set. Revisit if the client asks for
 * an explicit role switcher.
 */
const ROLE_PRECEDENCE: Role[] = [
  "company_manager",
  "store_manager",
  "factory_supervisor",
  "salesperson",
];

export function resolvePrimaryRole(roles: Role[]): Role | null {
  for (const role of ROLE_PRECEDENCE) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return roles[0] ?? null;
}
