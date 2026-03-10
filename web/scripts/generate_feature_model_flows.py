from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
SQL_PATH = ROOT_DIR / "src" / "core" / "sql" / "pawnshop.sql"
FEATURE_DIR = ROOT_DIR / "src" / "feature"

ENUM_VALUE_LABELS: dict[str, str] = {
    "male": "Laki-laki",
    "female": "Perempuan",
    "active": "Aktif",
    "inactive": "Tidak aktif",
    "blocked": "Diblokir",
    "draft": "Draf",
    "extended": "Diperpanjang",
    "redeemed": "Ditebus",
    "auctioned": "Dilelang",
    "closed": "Ditutup",
    "cancelled": "Dibatalkan",
    "in_office": "Di kantor",
    "in_warehouse": "Di gudang",
    "released": "Dikeluarkan",
    "returned": "Dikembalikan",
    "other": "Lainnya",
    "debit": "Debit",
    "credit": "Kredit",
    "open": "Terbuka",
    "partially_paid": "Dibayar sebagian",
    "paid": "Lunas",
    "sent": "Terkirim",
    "received": "Diterima",
    "expired": "Kedaluwarsa",
}

FEATURES: dict[str, dict[str, object]] = {
    "master_branch": {
        "module_key": "master-branch",
        "tables": ["branches", "storage_locations"],
    },
    "customer": {
        "module_key": "customer",
        "tables": ["customers", "customer_documents", "customer_contacts"],
    },
    "item_master": {
        "module_key": "item-master",
        "tables": ["item_categories", "item_types", "branch_item_settings"],
    },
    "pawn_transaction": {
        "module_key": "pawn-transaction",
        "tables": ["contract_payments", "contract_extensions", "auction_transactions"],
    },
    "branch_finance": {
        "module_key": "branch-finance",
        "tables": [
            "branch_cash_accounts",
            "branch_cash_transactions",
            "branch_debts",
            "branch_debt_payments",
            "inter_branch_transfers",
        ],
    },
    "master_investor": {
        "module_key": "master-investor",
        "tables": ["investors", "branch_investors", "investor_capital_transactions"],
    },
    "auth_access": {
        "module_key": "auth-access",
        "tables": ["roles", "users", "user_roles", "user_branch_assignments", "login_sessions"],
    },
    "support": {
        "module_key": "support",
        "tables": ["notifications", "audit_logs"],
    },
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


def parse_schema(sql_text: str) -> dict[str, TableDef]:
    table_pattern = re.compile(
        r"CREATE TABLE IF NOT EXISTS `(?P<name>[^`]+)` \((?P<body>.*?)\) ENGINE=",
        re.DOTALL,
    )
    column_pattern = re.compile(
        r"`(?P<name>[^`]+)`\s+(?P<type>[A-Z]+(?:\([^)]+\))?(?:\s+UNSIGNED)?)\s*(?P<tail>.*)"
    )
    tables: dict[str, TableDef] = {}

    for match in table_pattern.finditer(sql_text):
        name = match.group("name")
        body = match.group("body")
        columns: list[ColumnDef] = []

        for raw_line in body.splitlines():
            line = raw_line.strip().rstrip(",")
            if not line:
                continue

            column_match = column_pattern.match(line)
            if not column_match:
                continue

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

        tables[name] = TableDef(name=name, columns=columns)

    return tables


def singularize_word(word: str) -> str:
    if word.endswith("ies"):
        return word[:-3] + "y"
    if word.endswith(("ches", "shes", "xes", "zes")):
        return word[:-2]
    if word.endswith("sses"):
        return word[:-2]
    if word.endswith("s") and not word.endswith("ss"):
        return word[:-1]
    return word


def singularize_table(table_name: str) -> str:
    return "_".join(singularize_word(part) for part in table_name.split("_"))


def pascal_case(value: str) -> str:
    return "".join(part.capitalize() for part in value.split("_"))


def camel_case(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def kebab_case(value: str) -> str:
    return value.replace("_", "-")


def camel_from_pascal(value: str) -> str:
    return value[:1].lower() + value[1:]


def ts_quote(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def model_type(column: ColumnDef) -> str:
    if column.base_type == "ENUM":
        type_name = enum_alias_name(column_context_table_name, column.name)
    elif column.base_type == "JSON":
        type_name = "Record<string, unknown>"
    elif column.base_type == "TINYINT":
        type_name = "boolean"
    elif column.base_type in {"BIGINT", "INT", "SMALLINT", "DECIMAL"}:
        type_name = "number"
    else:
        type_name = "string"

    return f"{type_name} | null" if column.nullable else type_name


column_context_table_name = ""


def table_model_interface_name(table_name: str) -> str:
    return f"{pascal_case(singularize_table(table_name))}Model"


def table_row_interface_name(table_name: str) -> str:
    return f"{pascal_case(table_name)}Row"


def table_model_file_name(table_name: str) -> str:
    return f"{kebab_case(singularize_table(table_name))}.model.ts"


def model_property_name(column_name: str) -> str:
    return camel_case(column_name)


def model_array_property(table_name: str) -> str:
    return camel_case(table_name)


def dao_export_name(table_name: str) -> str:
    return f"{camel_case(table_name)}Dao"


def human_label(table_name: str) -> str:
    return " ".join(part.capitalize() for part in table_name.split("_"))


def feature_class_name(feature_folder: str) -> str:
    return pascal_case(feature_folder)


def feature_var_name(feature_folder: str) -> str:
    return camel_case(feature_folder)


def feature_data_model_file(feature_folder: str) -> str:
    return f"{kebab_case(feature_folder)}-data.model.ts"


def feature_data_model_name(feature_folder: str) -> str:
    return f"{feature_class_name(feature_folder)}DataModel"


def create_feature_data_factory_name(feature_folder: str) -> str:
    return f"create{feature_class_name(feature_folder)}DataModel"


def feature_mapper_name(feature_folder: str) -> str:
    return f"create{feature_class_name(feature_folder)}DataFromRows"


def enum_alias_name(table_name: str, column_name: str) -> str:
    return f"{pascal_case(singularize_table(table_name))}{pascal_case(column_name)}Model"


def enum_label(value: str) -> str:
    if value in ENUM_VALUE_LABELS:
        return ENUM_VALUE_LABELS[value]
    return value.replace("_", " ").capitalize()


def render_table_model(table_name: str, table_def: TableDef) -> str:
    global column_context_table_name
    column_context_table_name = table_name
    imports: list[str] = []
    enum_lines: list[str] = []
    has_enum = any(column.base_type == "ENUM" for column in table_def.columns)

    if has_enum:
        imports.append("import type { EnumOptionModel } from '@core/domain/models/enum-option.model';")

    for column in table_def.columns:
        if column.base_type == "ENUM":
            alias_name = enum_alias_name(table_name, column.name)
            enum_name_base = camel_from_pascal(alias_name.removesuffix("Model"))
            label_map_name = f"{enum_name_base}LabelMap"
            options_name = f"{enum_name_base}Options"
            values = " |\n    ".join(ts_quote(value) for value in column.enum_values)
            enum_lines.append(f"export type {alias_name} =\n    {values};")
            enum_lines.append("")
            enum_lines.append(f"export const {label_map_name}: Record<{alias_name}, string> = {{")
            for enum_value in column.enum_values:
                enum_lines.append(f"    {ts_quote(enum_value)}: {ts_quote(enum_label(enum_value))},")
            enum_lines.append("};")
            enum_lines.append("")
            enum_lines.append(f"export const {options_name}: EnumOptionModel<{alias_name}>[] = [")
            for enum_value in column.enum_values:
                enum_lines.append(
                    "    { value: "
                    + ts_quote(enum_value)
                    + ", label: "
                    + label_map_name
                    + "["
                    + ts_quote(enum_value)
                    + "] },"
                )
            enum_lines.append("];")
            enum_lines.append("")

    interface_name = table_model_interface_name(table_name)
    interface_lines = [f"export interface {interface_name} {{"]
    for column in table_def.columns:
        interface_lines.append(f"    {model_property_name(column.name)}: {model_type(column)};")
    interface_lines.append("}")

    content_lines: list[str] = []
    if imports:
        content_lines.extend(imports)
        content_lines.append("")
    content_lines.extend(enum_lines)
    content_lines.extend(interface_lines)
    content_lines.append("")
    return "\n".join(content_lines)


def mapper_value_expression(column: ColumnDef, row_alias: str) -> str:
    source = f"{row_alias}.{column.name}"
    if column.base_type == "TINYINT":
        return f"{source} === 1"
    return source


def render_feature_models(feature_folder: str, module_key: str, table_names: list[str], schema: dict[str, TableDef]) -> None:
    feature_path = FEATURE_DIR / feature_folder
    models_path = feature_path / "domain" / "models"
    models_path.mkdir(parents=True, exist_ok=True)

    exported_files: list[str] = []
    model_import_lines: list[str] = [
        "import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';",
        "import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';",
    ]

    for table_name in table_names:
        model_content = render_table_model(table_name, schema[table_name])
        file_name = table_model_file_name(table_name)
        (models_path / file_name).write_text(model_content, encoding="utf-8")
        exported_files.append(file_name[:-3])
        model_import_lines.append(
            f"import type {{ {table_model_interface_name(table_name)} }} from '@feature/{feature_folder}/domain/models/{file_name[:-3]}';"
        )

    data_model_name = feature_data_model_name(feature_folder)
    data_model_factory = create_feature_data_factory_name(feature_folder)
    data_model_lines = model_import_lines + ["", f"export interface {data_model_name} extends FeatureModuleDataModel {{"]
    for table_name in table_names:
        data_model_lines.append(
            f"    {model_array_property(table_name)}: {table_model_interface_name(table_name)}[];"
        )
    data_model_lines.append("}")
    data_model_lines.append("")
    data_model_lines.append(f"export const {data_model_factory} = (params: {{")
    data_model_lines.append("    module: AppModuleSummary;")
    for table_name in table_names:
        data_model_lines.append(
            f"    {model_array_property(table_name)}: {table_model_interface_name(table_name)}[];"
        )
    data_model_lines.append(f"}}): {data_model_name} => {{")
    data_model_lines.append("    const tableCounts: FeatureTableCountModel[] = [")
    for table_name in table_names:
        data_model_lines.append(
            "        { key: "
            + ts_quote(table_name)
            + ", label: "
            + ts_quote(human_label(table_name))
            + ", count: params."
            + model_array_property(table_name)
            + ".length },"
        )
    data_model_lines.append("    ];")
    data_model_lines.append("")
    data_model_lines.append("    return {")
    data_model_lines.append("        ...params,")
    data_model_lines.append("        tableCounts,")
    data_model_lines.append("        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)")
    data_model_lines.append("    };")
    data_model_lines.append("};")
    data_model_lines.append("")

    data_model_file = feature_data_model_file(feature_folder)
    (models_path / data_model_file).write_text("\n".join(data_model_lines), encoding="utf-8")
    exported_files.append(data_model_file[:-3])

    index_lines = [f"export * from './{file_name}';" for file_name in exported_files]
    index_lines.append("")
    (models_path / "index.ts").write_text("\n".join(index_lines), encoding="utf-8")


def render_feature_mapper(feature_folder: str, module_key: str, table_names: list[str]) -> str:
    mapper_lines: list[str] = [
        "import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';"
    ]

    db_imports: list[str] = []
    model_imports: list[str] = []

    for table_name in table_names:
        db_imports.append(table_row_interface_name(table_name))
        model_imports.append(f"type {table_model_interface_name(table_name)}")

    mapper_lines.append(
        "import type { "
        + ", ".join(db_imports)
        + " } from '@feature/"
        + feature_folder
        + "/data/db';"
    )
    mapper_lines.append(
        "import { "
        + create_feature_data_factory_name(feature_folder)
        + ", "
        + ", ".join(model_imports)
        + ", type "
        + feature_data_model_name(feature_folder)
        + " } from '@feature/"
        + feature_folder
        + "/domain/models';"
    )
    mapper_lines.append("")

    for table_name in table_names:
        model_name = table_model_interface_name(table_name)
        row_name = table_row_interface_name(table_name)
        mapper_name = f"map{pascal_case(table_name)}RowToModel"
        mapper_lines.append(f"export const {mapper_name} = (row: {row_name}): {model_name} => ({{")
        for column in schema[table_name].columns:
            mapper_lines.append(
                f"    {model_property_name(column.name)}: {mapper_value_expression(column, 'row')},"
            )
        mapper_lines.append("});")
        mapper_lines.append("")

    mapper_lines.append(f"export const {feature_mapper_name(feature_folder)} = (params: {{")
    mapper_lines.append("    module: AppModuleSummary;")
    for table_name in table_names:
        mapper_lines.append(f"    {model_array_property(table_name)}Rows: {table_row_interface_name(table_name)}[];")
    mapper_lines.append(f"}}): {feature_data_model_name(feature_folder)} =>")
    mapper_lines.append(f"    {create_feature_data_factory_name(feature_folder)}({{")
    mapper_lines.append("        module: params.module,")
    for table_name in table_names:
        mapper_lines.append(
            f"        {model_array_property(table_name)}: params.{model_array_property(table_name)}Rows.map(map{pascal_case(table_name)}RowToModel),"
        )
    mapper_lines.append("    });")
    mapper_lines.append("")

    return "\n".join(mapper_lines)


def render_local_datasource(feature_folder: str, module_key: str, table_names: list[str]) -> str:
    pascal_name = feature_class_name(feature_folder)
    local_class = f"{pascal_name}LocalDatasource"

    lines = [
        "import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';",
        "import { "
        + ", ".join(dao_export_name(table_name) for table_name in table_names)
        + " } from '@feature/"
        + feature_folder
        + "/data/db';",
        f"import {{ {feature_mapper_name(feature_folder)} }} from '@feature/{feature_folder}/data/mappers/{feature_folder}.mapper';",
        f"import type {{ {feature_data_model_name(feature_folder)} }} from '@feature/{feature_folder}/domain/models';",
        "",
        f"export class {local_class} {{",
        f"    async getData(): Promise<{feature_data_model_name(feature_folder)}> {{",
        "        const [",
        "            " + ",\n            ".join(f"{model_array_property(table_name)}Rows" for table_name in table_names),
        "        ] = await Promise.all([",
        "            " + ",\n            ".join(f"{dao_export_name(table_name)}.getAll()" for table_name in table_names),
        "        ]);",
        "",
        f"        return {feature_mapper_name(feature_folder)}({{",
        f"            module: getAppModuleByKey({ts_quote(module_key)}),",
    ]
    for table_name in table_names:
        lines.append(f"            {model_array_property(table_name)}Rows,")
    lines.extend(["        });", "    }", "}", ""])
    return "\n".join(lines)


def render_repository(feature_folder: str) -> str:
    return "\n".join(
        [
            f"import type {{ {feature_data_model_name(feature_folder)} }} from '@feature/{feature_folder}/domain/models';",
            "",
            f"export interface {feature_class_name(feature_folder)}Repository {{",
            f"    getData(): Promise<{feature_data_model_name(feature_folder)}>;",
            "}",
            "",
        ]
    )


def render_response(feature_folder: str) -> str:
    return "\n".join(
        [
            f"import type {{ {feature_data_model_name(feature_folder)} }} from '@feature/{feature_folder}/domain/models';",
            "",
            f"export interface I{feature_class_name(feature_folder)}Response {{",
            "    success: boolean;",
            f"    data: {feature_data_model_name(feature_folder)};",
            "    message: string;",
            "}",
            "",
        ]
    )


def render_usecase(feature_folder: str) -> str:
    pascal_name = feature_class_name(feature_folder)
    return "\n".join(
        [
            f"import type {{ {feature_data_model_name(feature_folder)} }} from '@feature/{feature_folder}/domain/models';",
            f"import type {{ {pascal_name}Repository }} from '@feature/{feature_folder}/domain/repositories/{feature_folder}.repository';",
            "",
            f"export class Get{pascal_name}DataUsecase {{",
            f"    constructor(private readonly repository: {pascal_name}Repository) {{}}",
            "",
            f"    async execute(): Promise<{feature_data_model_name(feature_folder)}> {{",
            "        return this.repository.getData();",
            "    }",
            "}",
            "",
        ]
    )


def render_repository_impl(feature_folder: str, table_names: list[str]) -> str:
    pascal_name = feature_class_name(feature_folder)
    lines = [
        "import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';",
        "import { "
        + ", ".join(dao_export_name(table_name) for table_name in table_names)
        + " } from '@feature/"
        + feature_folder
        + "/data/db';",
        f"import {{ {pascal_name}LocalDatasource }} from '@feature/{feature_folder}/data/datasources/{feature_folder}_local_datasource';",
        f"import type {{ {feature_data_model_name(feature_folder)} }} from '@feature/{feature_folder}/domain/models';",
        f"import type {{ {pascal_name}Repository }} from '@feature/{feature_folder}/domain/repositories/{feature_folder}.repository';",
        "",
        f"export class {pascal_name}RepositoryImpl implements {pascal_name}Repository {{",
        f"    constructor(private readonly localDataSource: {pascal_name}LocalDatasource) {{}}",
        "",
        f"    async getData(): Promise<{feature_data_model_name(feature_folder)}> {{",
        f"        await seedFeatureTablesIfEmpty('{pascal_name}RepositoryImpl', [",
        "            " + ",\n            ".join(dao_export_name(table_name) for table_name in table_names),
        "        ]);",
        "",
        "        return this.localDataSource.getData();",
        "    }",
        "}",
        "",
    ]
    return "\n".join(lines)


def render_di(feature_folder: str) -> str:
    pascal_name = feature_class_name(feature_folder)
    camel_name = feature_var_name(feature_folder)
    return "\n".join(
        [
            f"import {{ {pascal_name}LocalDatasource }} from '@feature/{feature_folder}/data/datasources/{feature_folder}_local_datasource';",
            f"import {{ {pascal_name}RepositoryImpl }} from '@feature/{feature_folder}/data/repositories/{feature_folder}_repository_impl';",
            f"import {{ Get{pascal_name}DataUsecase }} from '@feature/{feature_folder}/domain/usecases/get_{feature_folder}_data.usecase';",
            "",
            f"const {camel_name}LocalDatasource = new {pascal_name}LocalDatasource();",
            f"const {camel_name}Repository = new {pascal_name}RepositoryImpl({camel_name}LocalDatasource);",
            "",
            f"export const get{pascal_name}DataUsecase = new Get{pascal_name}DataUsecase({camel_name}Repository);",
            "",
        ]
    )


def render_state(feature_folder: str) -> str:
    pascal_name = feature_class_name(feature_folder)
    return "\n".join(
        [
            "import { ref, type Ref } from 'vue';",
            "",
            f"import type {{ {feature_data_model_name(feature_folder)} }} from '@feature/{feature_folder}/domain/models';",
            "",
            f"export interface I{pascal_name}State {{",
            f"    data: Ref<{feature_data_model_name(feature_folder)} | null>;",
            "    isLoading: Ref<boolean>;",
            "    error: Ref<string | null>;",
            "}",
            "",
            f"export const {feature_var_name(feature_folder)}State = (): I{pascal_name}State => ({{",
            "    data: ref(null),",
            "    isLoading: ref(false),",
            "    error: ref(null)",
            "});",
            "",
        ]
    )


def render_vm(feature_folder: str) -> str:
    pascal_name = feature_class_name(feature_folder)
    camel_name = feature_var_name(feature_folder)
    return "\n".join(
        [
            "import { defineStore } from 'pinia';",
            "",
            f"import {{ get{pascal_name}DataUsecase }} from '@feature/{feature_folder}/presentation/di/{feature_folder}.di';",
            f"import {{ {camel_name}State }} from '@feature/{feature_folder}/presentation/view_models/{feature_folder}.state';",
            "",
            f"export const {camel_name}ViewModel = defineStore('{camel_name}Store', () => {{",
            f"    const state = {camel_name}State();",
            "",
            "    const setError = (message: string | null): void => {",
            "        state.error.value = message;",
            "    };",
            "",
            f"    const get{pascal_name}Data = async (): Promise<void> => {{",
            "        state.isLoading.value = true;",
            "        setError(null);",
            "",
            "        try {",
            f"            state.data.value = await get{pascal_name}DataUsecase.execute();",
            "        } catch (error) {",
            "            setError(error instanceof Error ? error.message : String(error));",
            "        } finally {",
            "            state.isLoading.value = false;",
            "        }",
            "    };",
            "",
            "    return {",
            "        ...state,",
            f"        get{pascal_name}Data,",
            "        setError",
            "    };",
            "});",
            "",
        ]
    )


def render_view(feature_folder: str) -> str:
    pascal_name = feature_class_name(feature_folder)
    camel_name = feature_var_name(feature_folder)
    title = feature_folder.replace("_", " ").title()
    return "\n".join(
        [
            "<template>",
            "  <section v-if=\"isLoading\" class=\"card p-4\">",
            "    <div class=\"d-flex align-items-center gap-3\">",
            "      <div class=\"spinner-border text-primary\" role=\"status\" aria-hidden=\"true\" />",
            "      <div>",
            f"        <div class=\"fw-bold\">Loading {title}</div>",
            "        <div class=\"text-secondary\">Mengambil data lokal dari DAO feature.</div>",
            "      </div>",
            "    </div>",
            "  </section>",
            "",
            "  <section v-else-if=\"error\" class=\"card p-4\">",
            "    <div class=\"fw-bold text-danger mb-2\">Feature load failed</div>",
            "    <p class=\"mb-3 text-secondary\">{{ error }}</p>",
            f"    <button class=\"btn btn-primary\" type=\"button\" @click=\"vm.get{pascal_name}Data()\">",
            "      Muat ulang",
            "    </button>",
            "  </section>",
            "",
            "  <FeatureDataPage v-else-if=\"data\" :data=\"data\" />",
            "</template>",
            "",
            "<script setup lang=\"ts\">",
            "import { onMounted } from 'vue';",
            "import { storeToRefs } from 'pinia';",
            "",
            "import FeatureDataPage from '@core/presentation/components/feature_data_page.view.vue';",
            f"import {{ {camel_name}ViewModel }} from '@feature/{feature_folder}/presentation/view_models/{feature_folder}.vm';",
            "",
            f"const vm = {camel_name}ViewModel();",
            "const { data, isLoading, error } = storeToRefs(vm);",
            "",
            "onMounted(() => {",
            f"    void vm.get{pascal_name}Data();",
            "});",
            "</script>",
            "",
        ]
    )


schema = parse_schema(SQL_PATH.read_text(encoding="utf-8"))


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


for feature_folder, config in FEATURES.items():
    module_key = str(config["module_key"])
    table_names = list(config["tables"])
    feature_path = FEATURE_DIR / feature_folder

    render_feature_models(feature_folder, module_key, table_names, schema)

    write_file(
        feature_path / "data" / "mappers" / f"{feature_folder}.mapper.ts",
        render_feature_mapper(feature_folder, module_key, table_names),
    )
    write_file(
        feature_path / "data" / "datasources" / f"{feature_folder}_local_datasource.ts",
        render_local_datasource(feature_folder, module_key, table_names),
    )
    write_file(
        feature_path / "domain" / "repositories" / f"{feature_folder}.repository.ts",
        render_repository(feature_folder),
    )
    write_file(
        feature_path / "domain" / "responses" / f"{feature_folder}.response.ts",
        render_response(feature_folder),
    )
    write_file(
        feature_path / "domain" / "usecases" / f"get_{feature_folder}_data.usecase.ts",
        render_usecase(feature_folder),
    )
    write_file(
        feature_path / "data" / "repositories" / f"{feature_folder}_repository_impl.ts",
        render_repository_impl(feature_folder, table_names),
    )
    write_file(
        feature_path / "presentation" / "di" / f"{feature_folder}.di.ts",
        render_di(feature_folder),
    )
    write_file(
        feature_path / "presentation" / "view_models" / f"{feature_folder}.state.ts",
        render_state(feature_folder),
    )
    write_file(
        feature_path / "presentation" / "view_models" / f"{feature_folder}.vm.ts",
        render_vm(feature_folder),
    )
    write_file(
        feature_path / "presentation" / "views" / f"{feature_folder}.view.vue",
        render_view(feature_folder),
    )

    old_usecase = feature_path / "domain" / "usecases" / f"get_{feature_folder}_overview.usecase.ts"
    if old_usecase.exists():
        old_usecase.unlink()

    old_interface = feature_path / "domain" / "interfaces" / f"{feature_folder}_entity.ts"
    if old_interface.exists():
        old_interface.unlink()

print("Generated feature model flows for local DB features.")
