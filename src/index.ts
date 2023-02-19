import "reflect-metadata";
import { config } from "dotenv";
import ExpressWebServer from "~services/webserver/express/http-server";
import DependencyInjection from "~shared/dependency-injection";
import { AppDataSource } from "~services/database/typeorm/data-source";

import Token from "~modules/token/domain/value-objects/token";
import TokenDomain from "~modules/token/domain/token-domain";
import TokenType from "~modules/token/domain/value-objects/type";

const main = async () => {
  config();
  DependencyInjection.initialize();

  await AppDataSource.initialize();

  const httpServer = DependencyInjection.resolve(ExpressWebServer);
  await httpServer.start();

  const recoverPassToken = Token.create({ user: "eu", test: "testado" });
  if (recoverPassToken.isRight()) {
    recoverPassToken.value.getEncryptValue();
    const tokenType = TokenType.create("RECOVER_PASSWORD");
    if (tokenType.isRight()) {
      const token = await TokenDomain.create({
        userId: "659bf8a5-1d9c-4d93-bc81-5032dd79a0c6",
        type: tokenType.value,
        token: recoverPassToken.value,
        expiry: new Date(),
        usedAt: null,
      });

      if (token.isRight()) {
        const tokenValueDecrypted = token.value.token.getDecryptValue();
        console.log(
          "🚀 ~ file: index.ts:35 ~ main ~ tokenValueDecrypted",
          tokenValueDecrypted
        );
      }
    }
  }
};

main();
