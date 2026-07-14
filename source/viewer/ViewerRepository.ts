import type { PresentationRepository } from "../presentation/PresentationRepository";
import type { PresentationSnapshot } from "../presentation/interfaces/PresentationTypes";

export class ViewerRepository {
  constructor(private readonly presentation: PresentationRepository) {}
  getPresentation(): PresentationSnapshot { return this.presentation.get(); }
}
