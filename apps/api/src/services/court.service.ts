export default class CourtService {
  private static instance_: CourtService;

  static get() {
    if (!CourtService.instance_) {
      CourtService.instance_ = new CourtService();
    }
    return CourtService.instance_;
  }
}
