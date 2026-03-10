from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
SQL_PATH = ROOT_DIR / "src" / "core" / "sql" / "pawnshop.sql"
FEATURE_DIR = ROOT_DIR / "src" / "feature"

FEATURE_TABLES: dict[str, tuple[str, list[str]]] = {
    "master_branch": ("master-branch", ["branches", "storage_locations"]),
    "customer": ("customer", ["customers", "customer_documents", "customer_contacts"]),
    "item_master": ("item-master", ["item_categories", "item_types", "branch_item_settings"]),
    "pawn_contract": (
        "pawn-contract",
        [
            "pawn_contracts",
            "pawn_items",
            "pawn_item_accessories",
            "pawn_item_issues",
            "pawn_item_location_movements",
        ],
    ),
    "pawn_transaction": ("pawn-transaction", ["contract_payments", "contract_extensions", "auction_transactions"]),
    "branch_finance": (
        "branch-finance",
        [
            "branch_cash_accounts",
            "branch_cash_transactions",
            "branch_debts",
            "branch_debt_payments",
            "inter_branch_transfers",
        ],
    ),
    "master_investor": ("master-investor", ["investors", "branch_investors", "investor_capital_transactions"]),
    "auth_access": ("auth-access", ["roles", "users", "user_roles", "user_branch_assignments", "login_sessions"]),
    "support": ("support", ["notifications", "audit_logs"]),
}


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
    primary_key: list[str]


def pascal_case(value: str) -> str:
    return "".join(part.capitalize() for part in value.split("_"))


def camel_case(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def ts_quote(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def ts_type_for_column(column: ColumnDef) -> str:
    if column.base_type == "JSON":
        base = "Record<string, unknown>"
    elif column.base_type in {"BIGINT", "INT", "SMALLINT", "DECIMAL", "TINYINT"}:
        base = "number"
    elif column.base_type in {"DATE"}:
        base = "string"
    elif column.base_type in {"DATETIME", "TIMESTAMP"}:
        base = "string"
    else:
        base = "string"

    return f"{base} | null" if column.nullable else base


def data_type_for_column(column: ColumnDef) -> str:
    if column.base_type == "JSON":
        return "json"
    if column.base_type in {"BIGINT", "INT", "SMALLINT", "DECIMAL"}:
        return "number"
    if column.base_type == "TINYINT":
        return "number"
    if column.base_type == "DATE":
        return "date"
    if column.base_type in {"DATETIME", "TIMESTAMP"}:
        return "datetime"
    return "string"


def parse_schema(sql_text: str) -> dict[str, TableDef]:
    table_pattern = re.compile(
        r"CREATE TABLE IF NOT EXISTS `(?P<name>[^`]+)` \((?P<body>.*?)\) ENGINE=",
        re.DOTALL,
    )
    column_pattern = re.compile(
        r"`(?P<name>[^`]+)`\s+(?P<type>[A-Z]+(?:\([^)]+\))?(?:\s+UNSIGNED)?)\s*(?P<tail>.*)"
    )
    primary_key_pattern = re.compile(r"PRIMARY KEY \((?P<columns>[^)]+)\)")

    tables: dict[str, TableDef] = {}

    for match in table_pattern.finditer(sql_text):
        name = match.group("name")
        body = match.group("body")
        columns: list[ColumnDef] = []
        primary_key: list[str] = []

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

            primary_key_match = primary_key_pattern.search(line)
            if primary_key_match:
                primary_key = re.findall(r"`([^`]+)`", primary_key_match.group("columns"))

        tables[name] = TableDef(name=name, columns=columns, primary_key=primary_key)

    return tables


def render_table_file(feature_key: str, table: TableDef) -> str:
    interface_name = f"{pascal_case(table.name)}Row"
    table_var = f"{camel_case(table.name)}Table"
    primary_key_value = (
        ts_quote(table.primary_key[0])
        if len(table.primary_key) == 1
        else "[" + ", ".join(ts_quote(column) for column in table.primary_key) + "]"
    )

    interface_lines = [f"export interface {interface_name} {{"]
    for column in table.columns:
        interface_lines.append(f"    {column.name}: {ts_type_for_column(column)};")
    interface_lines.append("}")

    column_lines: list[str] = []
    for column in table.columns:
        parts = [
            f"name: {ts_quote(column.name)}",
            f"dataType: {ts_quote(data_type_for_column(column))}",
            f"nullable: {'true' if column.nullable else 'false'}",
            f"sqlType: {ts_quote(column.sql_type)}",
        ]
        if column.enum_values:
            enum_values = "[" + ", ".join(ts_quote(value) for value in column.enum_values) + "]"
            parts.append(f"enumValues: {enum_values}")
        column_lines.append("        { " + ", ".join(parts) + " },")

    return "\n".join(
        [
            "import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';",
            "",
            *interface_lines,
            "",
            f"export const {table_var} = createFeatureDbTable<{interface_name}>({{",
            f"    featureKey: {ts_quote(feature_key)},",
            f"    tableName: {ts_quote(table.name)},",
            f"    collectionName: {ts_quote(table.name)},",
            f"    primaryKey: {primary_key_value},",
            f"    seedPath: {ts_quote(f'/dummies/{table.name}.dummy.json')},",
            "    columns: [",
            *column_lines,
            "    ]",
            "});",
            "",
        ]
    )


def render_dao_file(feature_folder: str, table: TableDef) -> str:
    interface_name = f"{pascal_case(table.name)}Row"
    dao_class = f"{pascal_case(table.name)}Dao"
    dao_var = f"{camel_case(table.name)}Dao"
    table_var = f"{camel_case(table.name)}Table"

    return "\n".join(
        [
            "import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';",
            f"import {{ {table_var}, type {interface_name} }} from '@feature/{feature_folder}/data/db/{table.name}.table';",
            "",
            f"export class {dao_class} extends FeatureTableDao<{interface_name}> {{",
            "    constructor() {",
            f"        super({table_var});",
            "    }",
            "}",
            "",
            f"export const {dao_var} = new {dao_class}();",
            "",
        ]
    )


def render_index_file(table_names: list[str]) -> str:
    lines: list[str] = []
    for table_name in table_names:
        lines.append(f"export * from './{table_name}.table';")
        lines.append(f"export * from './{table_name}.dao';")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    schema = parse_schema(SQL_PATH.read_text(encoding="utf-8"))

    for feature_folder, (feature_key, table_names) in FEATURE_TABLES.items():
        db_dir = FEATURE_DIR / feature_folder / "data" / "db"
        db_dir.mkdir(parents=True, exist_ok=True)

        for table_name in table_names:
            table = schema[table_name]
            (db_dir / f"{table_name}.table.ts").write_text(
                render_table_file(feature_key, table),
                encoding="utf-8",
            )
            (db_dir / f"{table_name}.dao.ts").write_text(
                render_dao_file(feature_folder, table),
                encoding="utf-8",
            )

        (db_dir / "index.ts").write_text(render_index_file(table_names), encoding="utf-8")

    print("Generated feature db scaffolds.")


if __name__ == "__main__":
    main()
