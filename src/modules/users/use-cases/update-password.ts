import { injectable } from "tsyringe";
import UserPassword from "~modules/users/domain/value-objects/password";
import UserUseCaseError, {
  UserUseCaseErrors,
} from "~modules/users/use-cases/error";
import Crypto from "~services/cryptography/crypto";
import TokenRepository from "~services/database/typeorm/repositories/token-repository";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type UpdatePasswordParams = {
  id: string;
  deCryptedToken: string;
  currentPassword: string;
  newPassword: string;
};

type UpdatePasswordResponse = Either<UserUseCaseError, boolean>;

@injectable()
export default class UpdatePassword
  implements UseCase<UpdatePasswordParams, UpdatePasswordResponse>
{
  private readonly userRepository: UserRepository;
  private readonly tokenRepository: TokenRepository;
  private readonly crypto: Crypto;

  constructor(
    userRepository: UserRepository,
    tokenRepository: TokenRepository,
    crypto: Crypto
  ) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.crypto = crypto;
  }

  public async execute(
    params: UpdatePasswordParams
  ): Promise<UpdatePasswordResponse> {
    const { id, deCryptedToken, currentPassword, newPassword } = params;

    const user = await this.userRepository.findOneById(id);
    if (!user) {
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.userNotFound(id),
          Http.Status.BAD_REQUEST
        )
      );
    }

    const passwordMatch = await user.password.comparePassword(currentPassword);
    if (!passwordMatch) {
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.passwordNotMatch,
          Http.Status.BAD_REQUEST
        )
      );
    }

    const password = UserPassword.create(newPassword);
    if (password.isLeft()) {
      const errorMessage = password.value.message;
      const errorStatus = errorMessage.includes("Invalid")
        ? Http.Status.BAD_REQUEST
        : Http.Status.INTERNAL_SERVER_ERROR;

      return new Left(new UserUseCaseError(errorMessage, errorStatus));
    }

    const hashedPassword = await password.value.getHashedValue();
    const updatedOrError = await this.userRepository.update(id, {
      password: hashedPassword,
    });

    if (updatedOrError.isLeft()) {
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.couldNotUpdateUser,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const tokenDecrypted = this.crypto.encryptValue(deCryptedToken);
    const tokenUpdatedOrError = await this.tokenRepository.useToken({
      userId: id,
      token: tokenDecrypted,
    });
    if (tokenUpdatedOrError.isLeft()) {
      return new Left(
        new UserUseCaseError(
          tokenUpdatedOrError.value.message,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    return new Right(true);
  }
}
