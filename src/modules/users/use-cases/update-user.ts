import { injectable } from "tsyringe";
import UserName from "~modules/users/domain/value-objects/name";
import { UserDTO, UserDtoTransformer } from "~modules/users/dto/user-dto";
import UserUseCaseError, {
  UserUseCaseErrors,
} from "~modules/users/use-cases/error";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type UpdateUserParams = {
  id: string;
  user: {
    name: string;
  };
};

type UpdateUserResponse = Either<UserUseCaseError, UserDTO>;

@injectable()
export default class UpdateUser
  implements UseCase<UpdateUserParams, UpdateUserResponse>
{
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(request: UpdateUserParams): Promise<UpdateUserResponse> {
    const {
      id,
      user: { name },
    } = request;

    const user = await this.userRepository.findOneById(id);
    if (!user) {
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.userNotFound(id),
          Http.Status.NOT_FOUND
        )
      );
    }

    const userName = UserName.create(name);
    if (userName.isLeft()) {
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.invalidUserProps({
            name: userName.value.message,
          }),
          Http.Status.BAD_REQUEST
        )
      );
    }

    user.props.name = userName.value;
    const updatedUser = await this.userRepository.update(id, {
      name: userName.value.value,
    });

    if (updatedUser.isLeft()) {
      const errorMessage = updatedUser.value.message;

      if (errorMessage.includes("duplicated")) {
        return new Left(
          new UserUseCaseError(
            UserUseCaseErrors.duplicatedUserName(name),
            Http.Status.BAD_REQUEST
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

    return new Right(UserDtoTransformer.toUserDTO(user));
  }
}
