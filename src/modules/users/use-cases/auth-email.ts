import { injectable } from "tsyringe";
import UserUseCaseError, {
  UserUseCaseErrors,
} from "~modules/users/use-cases/error";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type AuthEmailParams = {
  id: string;
};

type AuthEmailResponse = Either<UserUseCaseError, boolean>;

@injectable()
export default class AuthEmail
  implements UseCase<AuthEmailParams, AuthEmailResponse>
{
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(params: AuthEmailParams): Promise<AuthEmailResponse> {
    const { id } = params;

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

    return new Right(true);
  }
}
