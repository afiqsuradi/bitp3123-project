import { UserService } from "../services/user.service";
export class UserController {
  private userService: UserService;
  constructor() {
    this.userService = UserService.getUserService();
  }
}
