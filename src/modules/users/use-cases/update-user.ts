import { injectable } from "tsyringe";
import UserName from "~modules/users/domain/value-objects/name";
import { UserDTO, UserDtoTransformer } from "~modules/users/dto/user-dto";
import UserMapper from "~modules/users/mappers/user-mapper";
import UserUseCaseError, {
  UserUseCaseErrors,
} from "~modules/users/use-cases/error";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type UpdateUserRequest = {
  id: string;
  user: {
    name?: string;
  };
};

type UpdateUserResponse = Either<UserUseCaseError, UserDTO>;

@injectable()
export default class UpdateUser
  implements UseCase<UpdateUserRequest, UpdateUserResponse>
{
  private userRepository: UserRepository;
  private userMapper: UserMapper;

  constructor(userRepository: UserRepository, userMapper: UserMapper) {
    this.userRepository = userRepository;
    this.userMapper = userMapper;
  }

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const {
      id,
      user: { name },
    } = request;

    const user = await this.userRepository.findOneById(id);
    if (!user) {
      return new Left(new UserUseCaseError(UserUseCaseErrors.userNotFound(id)));
    }

    const userName = UserName.create(name);
    if (userName.isLeft()) {
      return new Left(
        new UserUseCaseError(
          UserUseCaseErrors.invalidUserUpdateProps({
            name: userName.value.message,
          })
        )
      );
    }

    user.props.name = userName.value;
    const updatedUser = await this.userRepository.update(
      id,
      await this.userMapper.toPersistence(user)
    );

    if (updatedUser.isLeft()) {
      return new Left(
        new UserUseCaseError(UserUseCaseErrors.couldNotUpdateUser)
      );
    }

    return new Right(UserDtoTransformer.toUserDTO(user));
  }
}
