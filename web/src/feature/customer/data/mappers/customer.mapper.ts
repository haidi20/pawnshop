import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { CustomersRow, CustomerDocumentsRow, CustomerContactsRow } from '@feature/customer/data/db';
import { createCustomerDataModel, type CustomerModel, type CustomerDocumentModel, type CustomerContactModel, type CustomerDataModel } from '@feature/customer/domain/models';

export const mapCustomersRowToModel = (row: CustomersRow): CustomerModel => ({
    id: row.id,
    customerCode: row.customer_code,
    fullName: row.full_name,
    gender: row.gender,
    birthDate: row.birth_date,
    city: row.city,
    address: row.address,
    customerStatus: row.customer_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapCustomerDocumentsRowToModel = (row: CustomerDocumentsRow): CustomerDocumentModel => ({
    id: row.id,
    customerId: row.customer_id,
    documentType: row.document_type,
    documentNumber: row.document_number,
    isPrimary: row.is_primary === 1,
    issuedDate: row.issued_date,
    expiredDate: row.expired_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapCustomerContactsRowToModel = (row: CustomerContactsRow): CustomerContactModel => ({
    id: row.id,
    customerId: row.customer_id,
    contactType: row.contact_type,
    contactValue: row.contact_value,
    isPrimary: row.is_primary === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const createCustomerDataFromRows = (params: {
    module: AppModuleSummary;
    customersRows: CustomersRow[];
    customerDocumentsRows: CustomerDocumentsRow[];
    customerContactsRows: CustomerContactsRow[];
}): CustomerDataModel =>
    createCustomerDataModel({
        module: params.module,
        customers: params.customersRows.map(mapCustomersRowToModel),
        customerDocuments: params.customerDocumentsRows.map(mapCustomerDocumentsRowToModel),
        customerContacts: params.customerContactsRows.map(mapCustomerContactsRowToModel),
    });
