import { UserDomain } from "~modules/users/domain/user-domain";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  isDeleted?: boolean;
  deleteAt?: Date | null;
}
export class UserDtoTransformer {
  static toUserDTO(user: UserDomain): UserDTO {
    const id = user.id.toString();
    const name = user.name.value;
    const email = user.email.value;
    const isEmailVerified = user.isEmailVerified;
    const isAdmin = user.isAdmin;
    const isDeleted = user.isDeleted;
    const deleteAt = user.deletedAt;

    const userDto: UserDTO = {
      id,
      name,
      email,
      isEmailVerified,
      isAdmin,
      isDeleted,
      deleteAt,
    };
    return userDto;
  }
}
