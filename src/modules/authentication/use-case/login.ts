import { injectable } from "tsyringe";
import AuthenticationDomain from "~modules/authentication/domain/authentication-domain";
import {
  AuthenticationDTOTransformer,
  AuthenticationDTO,
} from "~modules/authentication/dto/session-dto";
import AuthenticationUseCaseError, {
  AuthenticationUseCaseErrors,
} from "~modules/authentication/use-case/error";
import AccessToken from "~modules/authentication/domain/value-objects/access-token";
import { UserDtoTransformer } from "~modules/users/dto/user-dto";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type LoginUseCaseParams = {
  email: string;
  password: string;
};

type LoginUseCaseResponse = Either<
  AuthenticationUseCaseError,
  AuthenticationDTO
>;

@injectable()
export default class LoginUseCase
  implements UseCase<LoginUseCaseParams, LoginUseCaseResponse>
{
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(
    params: LoginUseCaseParams
  ): Promise<LoginUseCaseResponse> {
    const { email, password } = params;

    const user = await this.userRepository.findOneByCriteria({ email });
    if (!user) {
      return new Left(
        new AuthenticationUseCaseError(
          AuthenticationUseCaseErrors.userNotExits(email),
          Http.Status.NOT_FOUND
        )
      );
    }

    const passwordMatch = await user.password.comparePassword(password);
    if (!passwordMatch) {
      return new Left(
        new AuthenticationUseCaseError(
          AuthenticationUseCaseErrors.invalidPassword,
          Http.Status.UNAUTHORIZED
        )
      );
    }

    const userDto = UserDtoTransformer.toUserDTO(user);
    const accessToken = AccessToken.create(userDto);
    if (accessToken.isLeft()) {
      return new Left(
        new AuthenticationUseCaseError(
          accessToken.value.message,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const authentication = await AuthenticationDomain.create({
      accessToken: accessToken.value,
      userId: user.id.toValue(),
    });
    if (authentication.isLeft()) {
      return new Left(
        new AuthenticationUseCaseError(
          authentication.value.message,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const authenticationDto = AuthenticationDTOTransformer.toDTO({
      user: userDto,
      authentication: authentication.value,
    });
    return new Right(authenticationDto);
  }
}
