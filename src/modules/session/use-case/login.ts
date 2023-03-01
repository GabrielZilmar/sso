import { injectable } from "tsyringe";
import SessionDomain from "~modules/session/domain/session-domain";
import {
  SessionDTOTransformer,
  SessionDTO,
} from "~modules/session/dto/session-dto";
import SessionUseCaseError, {
  SessionUseCaseErrors,
} from "~modules/session/use-case/error";
import AccessToken from "~modules/token/domain/value-objects/token";
import { UserDtoTransformer } from "~modules/users/dto/user-dto";
import UserRepository from "~services/database/typeorm/repositories/user-repository";
import { Http } from "~services/webserver/types";
import { UseCase } from "~shared/core/use-case";
import { Either, Left, Right } from "~shared/either";

type LoginUseCaseParams = {
  email: string;
  password: string;
};

type LoginUseCaseResponse = Either<SessionUseCaseError, SessionDTO>;

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
    if (!user?.id) {
      return new Left(
        new SessionUseCaseError(
          SessionUseCaseErrors.userNotExits(email),
          Http.Status.NOT_FOUND
        )
      );
    }

    const passwordMatch = await user.password.comparePassword(password);
    if (!passwordMatch) {
      return new Left(
        new SessionUseCaseError(
          SessionUseCaseErrors.invalidPassword,
          Http.Status.UNAUTHORIZED
        )
      );
    }

    const userDto = UserDtoTransformer.toUserDTO(user);
    const accessToken = AccessToken.create(userDto);
    if (accessToken.isLeft()) {
      return new Left(
        new SessionUseCaseError(
          accessToken.value.message,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const session = await SessionDomain.create({
      accessToken: accessToken.value,
      userId: user.id.toValue(),
    });
    if (session.isLeft()) {
      return new Left(
        new SessionUseCaseError(
          session.value.message,
          Http.Status.INTERNAL_SERVER_ERROR
        )
      );
    }

    const sessionDto = SessionDTOTransformer.toDTO({
      user: userDto,
      session: session.value,
    });
    return new Right(sessionDto);
  }
}
