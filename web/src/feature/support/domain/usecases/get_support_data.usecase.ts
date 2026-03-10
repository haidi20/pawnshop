import type { SupportDataModel } from '@feature/support/domain/models';
import type { SupportRepository } from '@feature/support/domain/repositories/support.repository';

export class GetSupportDataUsecase {
    constructor(private readonly repository: SupportRepository) {}

    async execute(): Promise<SupportDataModel> {
        return this.repository.getData();
    }
}
