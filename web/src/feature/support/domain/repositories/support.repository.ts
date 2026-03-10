import type { SupportDataModel } from '@feature/support/domain/models';

export interface SupportRepository {
    getData(): Promise<SupportDataModel>;
}
