import UserDomainError from "~modules/users/domain/errors";
import { UserDomain } from "~modules/users/domain/user-domain";
import UserEmail from "~modules/users/domain/value-objects/email";
import UserName from "~modules/users/domain/value-objects/name";
import UserPassword from "~modules/users/domain/value-objects/password";
import { User as UserEntity } from "~modules/users/entity/User";
import { Mapper } from "~shared/domain/mapper";
import { Either, Left, Right } from "~shared/either";

type UserEntityWithoutTimestamp = Omit<UserEntity, "createdAt" | "updatedAt">;

// TODO: Create GuardClass for Domains
export default class UserMapper
  implements Mapper<UserDomain, UserEntityWithoutTimestamp>
{
  public async toDomain(
    user: UserEntity
  ): Promise<Either<UserDomainError, UserDomain>> {
    const { name, email, password, isEmailVerified, isAdmin, deletedAt } = user;

    const nameOrError = UserName.create(name);
    if (nameOrError.isLeft()) {
      return new Left(nameOrError.value);
    }

    const emailOrError = UserEmail.create(email);
    if (emailOrError.isLeft()) {
      return new Left(emailOrError.value);
    }

    const passwordOrError = UserPassword.create(password, true);
    if (passwordOrError.isLeft()) {
      return new Left(passwordOrError.value);
    }

    const newUser = await UserDomain.create({
      name: nameOrError.value,
      email: emailOrError.value,
      password: passwordOrError.value,
      isEmailVerified,
      isAdmin,
      deletedAt,
    });
    if (newUser.isLeft()) {
      return new Left(newUser.value);
    }

    return new Right(newUser.value);
  }

  public async toPersistence(
    user: UserDomain
  ): Promise<UserEntityWithoutTimestamp> {
    let password: string = null;
    if (user.password) {
      if (user.password.isAlreadyHashed()) {
        password = user.password.value;
      } else {
        password = await user.password.getHashedValue();
      }
    }

    const newUser: UserEntityWithoutTimestamp = {
      id: user.id.toValue(),
      name: user.name.value,
      email: user.email.value,
      password,
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin,
      deletedAt: user.isDeleted ? new Date() : null,
    };

    return newUser;
  }
}
