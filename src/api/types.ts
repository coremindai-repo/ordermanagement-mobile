export type Role = "salesperson" | "factory_supervisor" | "store_manager" | "company_manager";

export type User = {
  userId: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
  roles: Role[];
};

export type LoginResponse = {
  token: string;
  expiresAt: string;
  user: User;
};
