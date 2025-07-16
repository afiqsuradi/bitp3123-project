import { UserService } from '../services/user.service';
export class UserController {
    userService: UserService;
    constructor() {
        this.userService = UserService.getUserService();
    }
}