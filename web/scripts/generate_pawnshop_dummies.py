from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[1]
SQL_PATH = ROOT_DIR / "src" / "core" / "sql" / "pawnshop.sql"
OUTPUT_DIR = ROOT_DIR / "public" / "dummies"
BASE_DATETIME = datetime(2026, 3, 10, 9, 0, 0)


@dataclass
class ColumnDef:
    name: str
    sql_type: str
    base_type: str
    nullable: bool
    enum_values: list[str]


@dataclass
class TableDef:
    name: str
    columns: list[ColumnDef]
    foreign_keys: dict[str, tuple[str, str]]
    order: int


TABLE_ROW_OVERRIDES: dict[str, list[dict[str, Any]]] = {
    "branches": [
        {
            "branch_code": "BR-MKS-001",
            "branch_number": "001",
            "branch_name": "Pawnshop Makassar Utama",
            "phone_number": "0411-800001",
            "address": "Jl. Jenderal Sudirman No. 10, Makassar",
        },
        {
            "branch_code": "BR-GOW-002",
            "branch_number": "002",
            "branch_name": "Pawnshop Gowa Selatan",
            "phone_number": "0411-800002",
            "address": "Jl. Sultan Hasanuddin No. 28, Gowa",
        },
    ],
    "investors": [
        {
            "investor_code": "INV-001",
            "full_name": "Budi Santoso",
            "phone_number": "081241110001",
            "address": "Perumahan Graha Indah Blok A1, Makassar",
        },
        {
            "investor_code": "INV-002",
            "full_name": "Siti Aminah",
            "phone_number": "081241110002",
            "address": "Jl. Tun Abdul Razak No. 15, Gowa",
        },
    ],
    "roles": [
        {"role_code": "ADMIN", "role_name": "Administrator"},
        {"role_code": "MANAGER", "role_name": "Branch Manager"},
    ],
    "users": [
        {
            "username": "admin.root",
            "password_hash": "$2b$10$dummyAdminRootHash",
            "full_name": "Root Admin",
            "email": "admin.root@pawnshop.local",
            "phone_number": "081355500001",
            "remember_token": "remember-admin-root",
        },
        {
            "username": "manager.branch",
            "password_hash": "$2b$10$dummyBranchManagerHash",
            "full_name": "Rina Maharani",
            "email": "manager.branch@pawnshop.local",
            "phone_number": "081355500002",
            "remember_token": "remember-manager-branch",
        },
    ],
    "customers": [
        {
            "customer_code": "CUST-0001",
            "full_name": "Andi Saputra",
            "city": "Makassar",
            "address": "Jl. Veteran Selatan No. 44, Makassar",
        },
        {
            "customer_code": "CUST-0002",
            "full_name": "Nur Aisyah",
            "city": "Gowa",
            "address": "Jl. Pallantikang No. 21, Gowa",
        },
    ],
    "item_categories": [
        {"category_code": "GOLD", "category_name": "Emas"},
        {"category_code": "ELEC", "category_name": "Elektronik"},
    ],
    "item_types": [
        {"type_code": "GOLD-RING", "type_name": "Cincin Emas"},
        {"type_code": "ELEC-LAPTOP", "type_name": "Laptop"},
    ],
    "storage_locations": [
        {
            "location_code": "OFF-MKS",
            "location_name": "Counter Makassar",
            "location_type": "office",
        },
        {
            "location_code": "WH-GOW",
            "location_name": "Gudang Gowa",
            "location_type": "warehouse",
        },
    ],
    "pawn_contracts": [
        {"contract_number": "CNTR-202603-0001", "amount_in_words": "Satu juta rupiah"},
        {"contract_number": "CNTR-202603-0002", "amount_in_words": "Dua juta rupiah"},
    ],
    "pawn_items": [
        {"item_name": "Cincin Emas 24K 5 gram", "brand_name": "No Brand"},
        {"item_name": "Laptop ASUS Vivobook", "brand_name": "ASUS"},
    ],
}


def parse_sql_schema(sql_text: str) -> list[TableDef]:
    tables: list[TableDef] = []
    pattern = re.compile(
        r"CREATE TABLE IF NOT EXISTS `(?P<name>[^`]+)` \((?P<body>.*?)\) ENGINE=",
        re.DOTALL,
    )
    column_pattern = re.compile(
        r"`(?P<name>[^`]+)`\s+(?P<type>[A-Z]+(?:\([^)]+\))?(?:\s+UNSIGNED)?)\s*(?P<tail>.*)"
    )
    fk_pattern = re.compile(
        r"FOREIGN KEY \(`(?P<column>[^`]+)`\) REFERENCES `(?P<table>[^`]+)` \(`(?P<ref>[^`]+)`\)"
    )

    for order, match in enumerate(pattern.finditer(sql_text)):
        name = match.group("name")
        body = match.group("body")
        columns: list[ColumnDef] = []
        foreign_keys: dict[str, tuple[str, str]] = {}

        for raw_line in body.splitlines():
            line = raw_line.strip().rstrip(",")
            if not line:
                continue

            column_match = column_pattern.match(line)
            if column_match:
                sql_type = column_match.group("type")
                base_type = sql_type.split("(")[0].split()[0]
                enum_values = re.findall(r"'([^']+)'", sql_type) if base_type == "ENUM" else []
                columns.append(
                    ColumnDef(
                        name=column_match.group("name"),
                        sql_type=sql_type,
                        base_type=base_type,
                        nullable="NOT NULL" not in column_match.group("tail"),
                        enum_values=enum_values,
                    )
                )
                continue

            fk_match = fk_pattern.search(line)
            if fk_match:
                foreign_keys[fk_match.group("column")] = (
                    fk_match.group("table"),
                    fk_match.group("ref"),
                )

        tables.append(TableDef(name=name, columns=columns, foreign_keys=foreign_keys, order=order))

    return tables


def row_count_for_table(table_name: str) -> int:
    override_rows = TABLE_ROW_OVERRIDES.get(table_name)
    if override_rows:
        return len(override_rows)
    return 2


def build_timestamp(table_order: int, row_index: int, hour_offset: int = 0) -> str:
    value = BASE_DATETIME - timedelta(days=table_order + row_index, hours=hour_offset)
    return value.strftime("%Y-%m-%d %H:%M:%S")


def build_date(column_name: str, table_order: int, row_index: int) -> str:
    if column_name == "birth_date":
        return f"199{row_index}-0{row_index + 4}-1{row_index + 2}"
    if column_name == "start_date":
        return f"2026-01-0{row_index + 1}"
    if column_name == "end_date":
        return f"2026-12-2{row_index + 1}"
    if column_name == "contract_date":
        return f"2026-02-0{row_index + 6}"
    if column_name == "maturity_date":
        return f"2026-03-2{row_index + 1}"
    if column_name == "extension_date":
        return f"2026-03-0{row_index + 7}"
    if column_name == "previous_maturity_date":
        return f"2026-03-0{row_index + 7}"
    if column_name == "new_maturity_date":
        return f"2026-03-2{row_index + 2}"
    if column_name == "debt_date":
        return f"2026-02-1{row_index + 1}"
    if column_name == "due_date":
        return f"2026-03-2{row_index + 4}"
    if column_name == "effective_from":
        return f"2026-01-0{row_index + 1}"
    if column_name == "effective_until":
        return f"2026-12-2{row_index + 1}"
    if column_name == "issued_date":
        return f"2021-0{row_index + 1}-10"
    if column_name == "expired_date":
        return f"2031-0{row_index + 1}-10"
    if column_name == "auction_date":
        return f"2026-03-0{row_index + 5}"
    return (BASE_DATETIME - timedelta(days=table_order + row_index)).strftime("%Y-%m-%d")


def build_datetime(column_name: str, table_order: int, row_index: int) -> str:
    if column_name == "login_at":
        return build_timestamp(table_order, row_index, 0)
    if column_name == "logout_at":
        return build_timestamp(table_order, row_index, -8)
    if column_name == "assigned_at":
        return build_timestamp(table_order, row_index, 1)
    if column_name == "unassigned_at":
        return build_timestamp(table_order, row_index, -24)
    if column_name == "payment_date":
        return build_timestamp(table_order, row_index, -2)
    if column_name in {"moved_at", "transaction_date", "transfer_date", "action_at", "read_at"}:
        return build_timestamp(table_order, row_index, -1)
    return build_timestamp(table_order, row_index, 0)


def build_number(column_name: str, row_index: int) -> int | float:
    if column_name == "ownership_percentage":
        return 60.0 if row_index == 0 else 40.0
    if column_name in {"margin_rate", "deduction_rate"}:
        return round(5.0 * (row_index + 1), 2)
    if column_name in {"appraised_value", "disbursed_value", "principal_amount", "outstanding_amount"}:
        return (row_index + 1) * 1000000
    if column_name.endswith("_amount") or column_name == "amount":
        return (row_index + 1) * 250000
    if column_name == "current_balance":
        return 10000000 + ((row_index + 1) * 2500000)
    if column_name in {"term_days", "extension_term_days"}:
        return 30
    if column_name == "payment_option_days":
        return 7
    if column_name in {"quantity", "sort_order", "item_sequence", "reference_id"}:
        return row_index + 1
    return row_index + 1


def build_string(table_name: str, column_name: str, row_index: int, row_data: dict[str, Any]) -> str:
    title = table_name.replace("_", " ").title()
    table_key = "".join(part[:3] for part in table_name.split("_")).upper()

    exact_values = {
        "document_type": ["KTP", "NPWP"],
        "contact_type": ["phone", "email"],
        "contact_value": [f"08129870000{row_index + 1}", f"user{row_index + 1}@pawnshop.local"],
        "payment_type": ["interest_payment", "partial_payment"],
        "payment_reference": [f"PMT-20260310-00{row_index + 1}", f"PMT-20260309-00{row_index + 1}"],
        "account_type": ["cash", "bank"],
        "transaction_type_code": ["CAPITAL_IN", "INTEREST_PAYMENT"],
        "debt_source_type": ["inter_branch", "vendor"],
        "debt_reference_number": [f"DEBT-MKS-00{row_index + 1}", f"DEBT-GOW-00{row_index + 1}"],
        "transfer_number": [f"TRF-202603-00{row_index + 1}", f"TRF-202603-01{row_index + 1}"],
        "notification_type": ["contract_due", "auction_completed"],
        "entity_type": ["pawn_contracts", "contract_payments"],
        "action_type": ["create", "update"],
        "ip_address": [f"10.10.0.{row_index + 10}", f"10.10.1.{row_index + 10}"],
        "user_agent": ["Chrome/136 Windows 11", "Edge/135 Windows 11"],
        "session_token": [f"session-token-{row_index + 1:04d}", f"session-token-{row_index + 11:04d}"],
        "remember_token": [f"remember-token-{row_index + 1:04d}", f"remember-token-{row_index + 11:04d}"],
        "summary": [f"Audit log untuk {title} 1.", f"Audit log untuk {title} 2."],
        "message": [f"Notifikasi contoh untuk {title} 1.", f"Notifikasi contoh untuk {title} 2."],
        "severity_level": ["low", "medium"],
        "from_status": ["draft", "in_office"],
        "to_status": ["in_office", "in_warehouse"],
        "location_type": ["office", "warehouse"],
        "account_name": ["Kas Operasional", "Rekening Bank"],
    }
    if column_name in exact_values:
        values = exact_values[column_name]
        return values[row_index % len(values)]

    if column_name.endswith("_code"):
        return f"{table_key}-{row_index + 1:03d}"
    if column_name.endswith("_number"):
        return f"{table_key}-{row_index + 1:04d}"
    if column_name == "email":
        username = row_data.get("username", f"user{row_index + 1}")
        return f"{username}@pawnshop.local"
    if column_name == "username":
        return f"user.{row_index + 1}"
    if column_name == "password_hash":
        return f"$2b$10$dummyHash{table_key}{row_index + 1}"
    if column_name == "phone_number":
        return f"0813555000{row_index + 1:02d}"
    if column_name == "full_name":
        return f"Sample {title} {row_index + 1}"
    if column_name == "branch_name":
        return f"Pawnshop Branch {row_index + 1}"
    if column_name == "category_name":
        return f"Kategori {row_index + 1}"
    if column_name == "type_name":
        return f"Tipe Barang {row_index + 1}"
    if column_name == "location_name":
        return f"Storage Location {row_index + 1}"
    if column_name == "item_name":
        return f"Pawn Item {row_index + 1}"
    if column_name == "brand_name":
        return f"Brand {row_index + 1}"
    if column_name == "model_name":
        return f"Model {row_index + 1}"
    if column_name == "serial_number":
        return f"SN-{table_key}-{row_index + 1:04d}"
    if column_name == "customer_code":
        return f"CUST-{row_index + 1:04d}"
    if column_name == "city":
        return ["Makassar", "Gowa"][row_index % 2]
    if column_name == "address":
        return f"Alamat contoh {title} {row_index + 1}"
    if column_name == "amount_in_words":
        return ["Satu juta rupiah", "Dua juta rupiah"][row_index % 2]
    if column_name == "contract_number":
        return f"CNTR-202603-{row_index + 1:04d}"
    if column_name == "reference_table":
        return ["pawn_contracts", "contract_payments"][row_index % 2]
    if column_name == "description":
        return f"Deskripsi contoh untuk {title} {row_index + 1}."
    if column_name == "notes":
        return f"Catatan contoh untuk {title} {row_index + 1}."
    if column_name == "maintenance_report":
        return f"Laporan maintenance contoh untuk {title} {row_index + 1}."
    if column_name == "item_description":
        return f"Deskripsi item contoh {row_index + 1}."
    if column_name == "condition_notes":
        return f"Kondisi item contoh {row_index + 1}."
    if column_name == "missing_notes":
        return f"Catatan kekurangan item contoh {row_index + 1}."
    if column_name == "issue_name":
        return f"Isu barang {row_index + 1}"
    if column_name == "issue_details":
        return f"Detail isu barang {row_index + 1}."
    if column_name == "accessory_name":
        return f"Aksesori barang {row_index + 1}"
    if column_name == "accessory_condition":
        return ["Baik", "Cukup"][row_index % 2]
    if column_name == "role_name":
        return f"Role {row_index + 1}"
    if column_name == "role_code":
        return f"ROLE-{row_index + 1:03d}"
    return f"{title} {column_name} {row_index + 1}"


def build_json_value(table_name: str, column_name: str, row_index: int) -> dict[str, Any]:
    return {
        "table": table_name,
        "column": column_name,
        "sampleIndex": row_index + 1,
    }


def should_return_null(column: ColumnDef, row_index: int) -> bool:
    if not column.nullable:
        return False
    if column.name in {"read_at", "logout_at", "unassigned_at", "end_date", "effective_until"}:
        return row_index == 0
    if column.name in {"maintenance_report", "missing_notes", "notes", "description"}:
        return row_index == 1
    return False


def build_value(
    table: TableDef,
    column: ColumnDef,
    row_index: int,
    generated_rows: dict[str, list[dict[str, Any]]],
    row_data: dict[str, Any],
) -> Any:
    if should_return_null(column, row_index):
        return None

    if column.name == "id":
        return row_index + 1

    foreign_key = table.foreign_keys.get(column.name)
    if foreign_key:
        ref_table, ref_column = foreign_key
        ref_rows = generated_rows[ref_table]
        return ref_rows[row_index % len(ref_rows)][ref_column]

    if column.base_type == "ENUM":
        return column.enum_values[row_index % len(column.enum_values)]

    if column.base_type == "TINYINT":
        return 1 if row_index == 0 else 0

    if column.base_type in {"BIGINT", "INT", "SMALLINT", "DECIMAL"}:
        return build_number(column.name, row_index)

    if column.base_type == "DATE":
        return build_date(column.name, table.order, row_index)

    if column.base_type in {"DATETIME", "TIMESTAMP"}:
        return build_datetime(column.name, table.order, row_index)

    if column.base_type == "JSON":
        return build_json_value(table.name, column.name, row_index)

    return build_string(table.name, column.name, row_index, row_data)


def generate_seed(tables: list[TableDef]) -> dict[str, list[dict[str, Any]]]:
    generated: dict[str, list[dict[str, Any]]] = {}

    for table in tables:
        rows: list[dict[str, Any]] = []
        override_rows = TABLE_ROW_OVERRIDES.get(table.name, [])

        for row_index in range(row_count_for_table(table.name)):
            row_data: dict[str, Any] = {}

            for column in table.columns:
                row_data[column.name] = build_value(table, column, row_index, generated, row_data)

            if row_index < len(override_rows):
                row_data.update(override_rows[row_index])

            rows.append(row_data)

        generated[table.name] = rows

    return generated


def write_seed_files(seed: dict[str, list[dict[str, Any]]]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest_rows: list[dict[str, Any]] = []

    for table_name, rows in seed.items():
        file_name = f"{table_name}.dummy.json"
        output_path = OUTPUT_DIR / file_name
        output_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        manifest_rows.append(
            {
                "table": table_name,
                "file": f"/dummies/{file_name}",
                "rowCount": len(rows),
            }
        )

    (OUTPUT_DIR / "pawnshop.seed.json").write_text(
        json.dumps(seed, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (OUTPUT_DIR / "pawnshop.manifest.json").write_text(
        json.dumps(
            {
                "database": "pawnshop",
                "generatedFrom": "/src/core/sql/pawnshop.sql",
                "tableCount": len(seed),
                "tables": manifest_rows,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )


def main() -> None:
    sql_text = SQL_PATH.read_text(encoding="utf-8")
    tables = parse_sql_schema(sql_text)
    seed = generate_seed(tables)
    write_seed_files(seed)
    print(f"Generated dummy data for {len(seed)} tables in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
