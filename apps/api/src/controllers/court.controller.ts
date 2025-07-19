import CourtService from "../services/court.service";

export default class CourtController {
  private courtService: CourtService;
  constructor() {
    this.courtService = CourtService.get();
  }
}
