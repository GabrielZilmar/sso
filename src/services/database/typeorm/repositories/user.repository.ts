import { User } from "~modules/users/entity/User";
import { BaseRepository } from "~services/database/typeorm/repositories/base/base-repository";

export default class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }
}
