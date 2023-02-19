import SessionDomain from "~modules/session/domain/session-domain";
import { UserDTO } from "~modules/users/dto/user-dto";

export interface UserSession {
  user: UserDTO;
  session: SessionDomain;
}

export interface SessionDTO {
  user: UserDTO;
  accessToken: string;
}

export class SessionDTOTransformer {
  public static toDTO(props: UserSession): SessionDTO {
    const { user, session } = props;
    const accessToken = session.accessToken.value;

    const sessionDto: SessionDTO = {
      user,
      accessToken,
    };

    return sessionDto;
  }
}
