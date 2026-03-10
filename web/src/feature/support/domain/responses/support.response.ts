import type { SupportDataModel } from '@feature/support/domain/models';

export interface ISupportResponse {
    success: boolean;
    data: SupportDataModel;
    message: string;
}
