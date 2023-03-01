import { injectable } from "tsyringe";
import { UserDTO, UserDtoTransformer } from "~modules/users/dto/user-dto";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { UseCase } from "~shared/core/use-case";

type GetUsersParams = {
  skip?: number;
  offset?: number;
};

type GetUsersResponse = { users: UserDTO[]; count: number };

@injectable()
export default class GetUsers
  implements UseCase<GetUsersParams, GetUsersResponse>
{
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute({
    skip = 0,
    offset = 10,
  }: GetUsersParams): Promise<GetUsersResponse> {
    const { items, count } = await this.userRepository.findAll(skip, offset);

    const usersDto = items.map((user) => UserDtoTransformer.toUserDTO(user));
    return {
      users: usersDto,
      count,
    };
  }
}
