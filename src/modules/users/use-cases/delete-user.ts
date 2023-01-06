import { injectable } from "tsyringe";
import UserUseCaseError, {
  UserUseCaseErrors,
} from "~modules/users/use-cases/error";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type DeleteUserParams = {
  id: string;
};

type DeleteUserResponse = Either<UserUseCaseError, boolean>;

@injectable()
export default class DeleteUser
  implements UseCase<DeleteUserParams, DeleteUserResponse>
{
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(request: DeleteUserParams): Promise<DeleteUserResponse> {
    const { id } = request;

    const userHasDeleted = await this.userRepository.delete(id);
    if (userHasDeleted.isLeft()) {
      return new Left(new UserUseCaseError(UserUseCaseErrors.userNotFound(id)));
    }

    return new Right(userHasDeleted.value);
  }
}
