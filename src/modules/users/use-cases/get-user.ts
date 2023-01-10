import { injectable } from "tsyringe";
import { UserDTO, UserDtoTransformer } from "~modules/users/dto/user-dto";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { UseCase } from "~shared/core/use-case";

type GetUserParams = {
  id: string;
};

type GetUserResponse = UserDTO | null;

@injectable()
export default class GetUser
  implements UseCase<GetUserParams, GetUserResponse>
{
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(request: GetUserParams): Promise<GetUserResponse> {
    const { id } = request;

    const user = await this.userRepository.findOneById(id);

    if (!user) {
      return null;
    }

    const userDto = UserDtoTransformer.toUserDTO(user);

    return userDto;
  }
}
