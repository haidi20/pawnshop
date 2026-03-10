import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import type { CustomerModel } from '@feature/customer/domain/models/customer.model';
import type { CustomerDocumentModel } from '@feature/customer/domain/models/customer-document.model';
import type { CustomerContactModel } from '@feature/customer/domain/models/customer-contact.model';

export interface CustomerDataModel extends FeatureModuleDataModel {
    customers: CustomerModel[];
    customerDocuments: CustomerDocumentModel[];
    customerContacts: CustomerContactModel[];
}

export const createCustomerDataModel = (params: {
    module: AppModuleSummary;
    customers: CustomerModel[];
    customerDocuments: CustomerDocumentModel[];
    customerContacts: CustomerContactModel[];
}): CustomerDataModel => {
    const tableCounts: FeatureTableCountModel[] = [
        { key: 'customers', label: 'Customers', count: params.customers.length },
        { key: 'customer_documents', label: 'Customer Documents', count: params.customerDocuments.length },
        { key: 'customer_contacts', label: 'Customer Contacts', count: params.customerContacts.length },
    ];

    return {
        ...params,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)
    };
};
