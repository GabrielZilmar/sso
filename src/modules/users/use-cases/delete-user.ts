import { injectable } from "tsyringe";
import UserMapper from "~modules/users/mappers/user-mapper";
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
  private userMapper: UserMapper;

  constructor(userRepository: UserRepository, userMapper: UserMapper) {
    this.userRepository = userRepository;
    this.userMapper = userMapper;
  }

  public async execute(request: DeleteUserParams): Promise<DeleteUserResponse> {
    const { id } = request;

    const user = await this.userRepository.findOneById(id);
    if (!user) {
      return new Left(new UserUseCaseError(UserUseCaseErrors.userNotFound(id)));
    }

    if (user.isDeleted) {
      return new Left(
        new UserUseCaseError(UserUseCaseErrors.userIsAlreadyDeleted(id))
      );
    }

    await user.delete();
    const userHasDeleted = await this.userRepository.save(
      await this.userMapper.toPersistence(user)
    );

    if (userHasDeleted.isLeft()) {
      return new Left(
        new UserUseCaseError(UserUseCaseErrors.couldNotSaveUser(id))
      );
    }

    return new Right(true);
  }
}
