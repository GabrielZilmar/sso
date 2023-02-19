import TokenDomain from "~modules/token/domain/token-domain";
import { Token } from "~modules/token/Entity/Token";
import TokenMapper from "~modules/token/mappers/token-mapper";
import { BaseRepository } from "~services/database/typeorm/repositories/base/base-repository";
import DependencyInjection from "~shared/dependency-injection";

export type PreventDuplicatedParams = {
  name?: string;
  email?: string;
};

export default class TokenRepository extends BaseRepository<
  Token,
  TokenDomain
> {
  constructor() {
    const tokenMapper = DependencyInjection.resolve(TokenMapper);
    super(Token, tokenMapper);
  }
}
