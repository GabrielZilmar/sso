export interface UserDTO {
  id: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  isDeleted?: boolean;
  deleteAt?: Date | null;
}
