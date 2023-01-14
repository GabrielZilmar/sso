import AuthenticationDomain from "~modules/authentication/domain/authentication-domain";
import { UserDTO } from "~modules/users/dto/user-dto";

export interface UserAuthentication {
  user: UserDTO;
  authentication: AuthenticationDomain;
}

export interface AuthenticationDTO {
  user: UserDTO;
  accessToken: string;
}

export class AuthenticationDTOTransformer {
  public static toDTO(props: UserAuthentication): AuthenticationDTO {
    const { user, authentication } = props;
    const accessToken = authentication.accessToken.value;

    const authenticationDto: AuthenticationDTO = {
      user,
      accessToken,
    };

    return authenticationDto;
  }
}
