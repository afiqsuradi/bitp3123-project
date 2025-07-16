export class UserService {
    private static instance_: UserService;
    static getUserService() {
        if (!UserService.instance_) {
            UserService.instance_ = new UserService();
        }
        return UserService.instance_;
    }
}