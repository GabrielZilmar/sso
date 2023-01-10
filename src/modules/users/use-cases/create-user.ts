import { injectable } from "tsyringe";
import UserDomainError from "~modules/users/domain/errors";
import { UserDomain } from "~modules/users/domain/user-domain";
import UserEmail from "~modules/users/domain/value-objects/email";
import UserName from "~modules/users/domain/value-objects/name";
import UserPassword from "~modules/users/domain/value-objects/password";
import { UserDTO, UserDtoTransformer } from "~modules/users/dto/user-dto";
import UserMapper from "~modules/users/mappers/user-mapper";
import UserUseCaseError, {
  UserUseCaseErrors,
} from "~modules/users/use-cases/error";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type CreateUserParams = {
  email: string;
  name: string;
  password: string;
};

type CreateUserResponse = Either<UserUseCaseError, UserDTO>;

type ValidateParamsParams = {
  email: Either<UserDomainError, UserEmail>;
  name: Either<UserDomainError, UserName>;
  password: Either<UserDomainError, UserPassword>;
};

@injectable()
export default class CreateUser
  implements UseCase<CreateUserParams, CreateUserResponse>
{
  private userRepository: UserRepository;
  private userMapper: UserMapper;

  constructor(userRepository: UserRepository, userMapper: UserMapper) {
    this.userRepository = userRepository;
    this.userMapper = userMapper;
  }

  private validateParams({
    email,
    name,
    password,
  }: ValidateParamsParams): Either<UserUseCaseError, boolean> {
    const errors: { [key: string]: string } = {};
    let hasError = false;

    if (email.isLeft()) {
      errors.email = email.value.message;
      hasError = true;
    }
    if (name.isLeft()) {
      errors.name = name.value.message;
      hasError = true;
    }
    if (password.isLeft()) {
      errors.password = password.value.message;
      hasError = true;
    }

    if (hasError) {
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.invalidUserProps(errors),
          Http.Status.BAD_REQUEST
        )
      );
    }

    return new Right(true);
  }

  public async execute(params: CreateUserParams): Promise<CreateUserResponse> {
    const { email, name, password } = params;

    const userEmail = UserEmail.create(email);
    const userName = UserName.create(name);
    const userPassword = UserPassword.create(password);

    const isValidProps = this.validateParams({
      email: userEmail,
      name: userName,
      password: userPassword,
    });

    if (isValidProps.isLeft()) {
      return new Left(isValidProps.value);
    }

    await (userPassword.value as UserPassword).getHashedValue();
    const user = await UserDomain.create({
      email: userEmail.value as UserEmail,
      name: userName.value as UserName,
      password: userPassword.value as UserPassword,
    });
    if (user.isLeft()) {
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.invalidUserProps(params),
          Http.Status.BAD_REQUEST
        )
      );
    }

    const userPersistence = await this.userMapper.toPersistence(user.value);

    const newUserFromDb = await this.userRepository.create(userPersistence);
    if (newUserFromDb.isLeft()) {
      if (newUserFromDb.value.message.includes("duplicated")) {
        return new Left(
          new UserUseCaseError(
            UserUseCaseErrors.duplicatedItem(name),
            Http.Status.BAD_REQUEST
          )
        );
      }

      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.couldNotCreateUser,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    return new Right(UserDtoTransformer.toUserDTO(newUserFromDb.value));
  }
}
