import { injectable } from "tsyringe";
import UserUseCaseError, {
  UserUseCaseErrors,
} from "~modules/users/use-cases/error";
import Crypto from "~services/cryptography/crypto";
import TokenRepository from "~services/database/typeorm/repositories/token-repository";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type AuthEmailParams = {
  id: string;
  decryptedToken: string;
};

type AuthEmailResponse = Either<UserUseCaseError, boolean>;

@injectable()
export default class AuthEmail
  implements UseCase<AuthEmailParams, AuthEmailResponse>
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

  public async execute(params: AuthEmailParams): Promise<AuthEmailResponse> {
    const { id, decryptedToken } = params;

    const updatedOrError = await this.userRepository.update(id, {
      isEmailVerified: true,
    });

    if (updatedOrError.isLeft()) {
      const errorMessage = updatedOrError.value.message;

      if (errorMessage.includes("not found")) {
        return new Left(
          new UserUseCaseError(
            UserUseCaseErrors.userNotFound(id),
            Http.Status.NOT_FOUND
          )
        );
      }
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.couldNotUpdateUser,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const tokenEncrypted = this.crypto.encryptValue(decryptedToken);
    const tokenUpdatedOrError = await this.tokenRepository.useToken({
      userId: id,
      token: tokenEncrypted,
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
