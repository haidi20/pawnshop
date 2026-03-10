import os
import sys

# --- 1. Fungsi Utilitas Penamaan (SAMA) ---

def to_pascal_case(snake_str):
    """Mengubah snake_case (e.g., product_list) menjadi PascalCase (e.g., ProductList)."""
    snake_str = snake_str.replace('-', '_').replace(' ', '_')
    components = snake_str.split('_')
    return "".join(x.title() for x in components)

def get_entity_name_and_pascal(feature_name_snake):
    """
    Menentukan entity_name (tunggal) dan feature_name_pascal (jamak, PascalCase).
    Menangani kasus pluralisasi '-y' ke '-ies'.
    """
    components = feature_name_snake.split('_')
    entity_name_raw = components[-1] # Entitas selalu kata terakhir

    # Logika Pluralisasi untuk Entity
    if entity_name_raw.endswith('y') and len(entity_name_raw) > 1 and entity_name_raw[-2] not in 'aeiou':
        # Contoh: history -> histor-ies
        entity_name_plural_suffix = entity_name_raw[:-1] + 'ies'
        entity_name_singular = entity_name_raw
    elif entity_name_raw.endswith('s'):
        # Contoh: users -> users
        entity_name_plural_suffix = entity_name_raw
        entity_name_singular = entity_name_raw[:-1] # Tebakan tunggal: users -> user
    else:
        # Contoh: product -> products
        entity_name_plural_suffix = entity_name_raw + 's'
        entity_name_singular = entity_name_raw

    # Membangun PascalCase jamak (Feature Name Pascal Plural)
    pascal_components = [x.title() for x in components[:-1]] + [entity_name_plural_suffix.title()]
    feature_name_pascal_plural = "".join(pascal_components)

    return entity_name_singular, feature_name_pascal_plural

def get_entity_name_plural_snake(entity_name_singular):
    """Mendapatkan bentuk snake_case jamak dari entity_name tunggal."""
    if entity_name_singular.endswith('y') and len(entity_name_singular) > 1 and entity_name_singular[-2] not in 'aeiou':
        return entity_name_singular[:-1] + 'ies'
    elif entity_name_singular.endswith('s'):
        return entity_name_singular # Anggap sudah jamak
    else:
        return entity_name_singular + 's'

# --- 2. Konfigurasi Struktur ---

# Sesuai Hirarki Warehouse (Clean Architecture/DDD)
FEATURE_STRUCTURE = [
    # Data Layer
    os.path.join('data', 'datasource', 'db'),
    os.path.join('data', 'repository'),
    # Domain Layer
    os.path.join('domain', 'interface'),
    os.path.join('domain', 'repository'),
    os.path.join('domain', 'response'),
    os.path.join('domain', 'usecase'),
    # Presentation Layer
    os.path.join('presentation', 'di'),
    os.path.join('presentation', 'style'),
    os.path.join('presentation', 'view'),
    os.path.join('presentation', 'view', 'component'),
    os.path.join('presentation', 'view', 'page'),
    os.path.join('presentation', 'service'),
    os.path.join('presentation', 'view_model'),
    'test',
    # Utility Layer
    'util',
]

# --- 3. Fungsi Pembuat Konten Placeholder ---

def _generate_placeholder_content(naming):
    """
    Menghasilkan kamus (dictionary) dengan jalur file dan konten placeholder.
    """
    entity_name = naming['entity_name']
    entity_name_pascal_singular = naming['entity_name_pascal_singular']
    feature_name_snake = naming['feature_name_snake']
    feature_name_pascal = naming['feature_name_pascal']
    feature_name_url = naming['feature_name_url']
    entity_name_jamak = naming['entity_name_jamak']

    # Domain/Interfaces (Tunggal)
    interface_content = (
        f'// domain/interfaces/{entity_name}.interface.ts\n'
        f'export interface I{entity_name_pascal_singular} {{\n'
        f'   id?: string | null;\n'
        f'   name?: string | null;\n'
        f'   // Tambahkan properti lain di sini (gunakan tipe nullable jika perlu)\n'
        f'}}\n\n'
        f'export const {entity_name_pascal_singular}Model = {{\n'
        f'   fromServer(json: any): I{entity_name_pascal_singular} {{\n'
        f'      return {{\n'
        f'         id: json.id ?? null,\n'
        f'         name: json.name ?? null,\n'
        f'         // Map properti lain di sini (gunakan fallback null jika tidak ada)\n'
        f'      }};\n'
        f'   }}\n'
        f'}};\n'
    )

    # Domain/Repository (Tunggal)
    repo_interface_content = (
        f'// domain/repository/{entity_name}.repository.ts\n'
        f'import type {{ Either }} from \'fp-ts/Either\';\n'
        f'import type {{ I{entity_name_pascal_singular} }} from \'@/feature/{feature_name_snake}/domain/interfaces/{entity_name}.interface\';\n\n'
        f'export interface I{entity_name_pascal_singular}Repository {{\n'
        f'   // Network and Local Access\n'
        f'   get{feature_name_pascal}(query?: string): Promise<Either<string, I{entity_name_pascal_singular}[]>>;\n'
        f'}}\n'
    )

    # Domain/UseCase (Contoh Use Case Tunggal)
    usecase_content = (
        f'// domain/usecase/get_{entity_name}s.usecase.ts\n'
        f'import type {{ I{entity_name_pascal_singular} }} from \'@/feature/{feature_name_snake}/domain/interfaces/{entity_name}.interface\';\n'
        f'import type {{ I{entity_name_pascal_singular}Repository }} from \'@/feature/{feature_name_snake}/domain/repository/{entity_name}.repository\';\n'
        f'import {{ right, left, type Either }} from \'fp-ts/Either\';\n\n'
        f'export class Get{feature_name_pascal}sUseCase {{\n'
        f'   private repository: I{entity_name_pascal_singular}Repository;\n\n'
        f'   constructor(repository: I{entity_name_pascal_singular}Repository) {{\n'
        f'      this.repository = repository;\n'
        f'   }}\n\n'
        f'   async call(query?: string): Promise<Either<string, I{entity_name_pascal_singular}[]>> {{\n'
        f'      try {{\n'
        f'         const data = await this.repository.get{feature_name_pascal}(query);\n'
        f'         return right(data);\n'
        f'      }} catch (error: any) {{\n'
        f'         return left(`Gagal mengambil data {entity_name}.: ${{error.message || \'Kesalahan tidak dikenal\'}}`);\n'
        f'      }}\n'
        f'   }}\n'
        f'}}\n'
    )

    # Data/Repository Impl
    repo_impl_content = (
        f'// data/repository/{entity_name}.repository.impl.ts\n'
        f'import {{ right, left, isLeft, isRight, type Either }} from \'fp-ts/lib/Either\';\n'
        f'import type {{ I{entity_name_pascal_singular} }} from \'@/feature/{feature_name_snake}/domain/interfaces/{entity_name}.interface\';\n'
        f'import type {{ I{entity_name_pascal_singular}Repository }} from \'@/feature/{feature_name_snake}/domain/repository/{entity_name}.repository\';\n'
        f'import type {{ I{entity_name_pascal_singular}Response }} from \'@/feature/{feature_name_snake}/domain/response/{entity_name}.response\';\n'
        f'import {{ {entity_name_pascal_singular}LocalDatasource }} from \'@/feature/{feature_name_snake}/data/datasources/{entity_name}.local.datasource\';\n'
        f'import {{ {entity_name_pascal_singular}RemoteDatasource }} from \'@/feature/{feature_name_snake}/data/datasources/{entity_name}.remote.datasource\';\n\n'
        f'export class {entity_name_pascal_singular}RepositoryImpl implements I{entity_name_pascal_singular}Repository {{\n'
        f'    constructor(\n'
        f'        private readonly remoteDataSource: {entity_name_pascal_singular}RemoteDatasource,\n'
        f'        private readonly localDataSource: {entity_name_pascal_singular}LocalDatasource,\n'
        f'    ) {{ }}\n\n'
        f'    async get{feature_name_pascal}(query?: string): Promise<Either<string, I{entity_name_pascal_singular}[]>> {{\n'
        f'        try {{\n'
        f'            const remoteResult = await this.remoteDataSource.fetch{feature_name_pascal}(query);\n'
        f'            if (isLeft(remoteResult)) {{\n'
        f'                const localResult = await this.localDataSource.get{feature_name_pascal}(query);\n'
        f'                if (isLeft(localResult)) {{\n'
        f'                    return left(remoteResult.left || localResult.left || \'Unknown error\');\n'
        f'                }} else {{\n'
        f'                    return right(localResult.right.data.{entity_name_jamak});\n'
        f'                }}\n'
        f'            }} else {{\n'
        f'                const items = remoteResult.right.data.{entity_name_jamak};\n'
        f'                await this.localDataSource.save{feature_name_pascal}(items);\n'
        f'                const responseLocal = await this.localDataSource.get{feature_name_pascal}(query);\n'
        f'                if (isLeft(responseLocal)) {{\n'
        f'                    return left(responseLocal.left);\n'
        f'                }}\n'
        f'                return right(responseLocal.right.data.{entity_name_jamak});\n'
        f'            }}\n'
        f'        }} catch (error) {{\n'
        f'            return left(error instanceof Error ? error.message : String(error));\n'
        f'        }}\n'
        f'    }}\n\n'
        f'    async delete{feature_name_pascal}(): Promise<Either<string, boolean>> {{\n'
        f'        try {{\n'
        f'            await this.localDataSource.delete{feature_name_pascal}();\n'
        f'            return right(true);\n'
        f'        }} catch (error) {{\n'
        f'            return left(error instanceof Error ? error.message : String(error));\n'
        f'        }}\n'
        f'    }}\n'
        f'}}\n'
    )

    # Presentation/ViewModel
    vm_content = (
        f'// presentation/view_model/{entity_name}.vm.ts\n'
        f'import {{ ref, type Ref }} from \'vue\';\n'
        f'import {{ defineStore }} from \'pinia\';\n'
        f'import {{ fold }} from \'fp-ts/Either\';\n'
        f'import type {{ I{entity_name_pascal_singular} }} from \'@/feature/{feature_name_snake}/domain/interfaces/{entity_name}.interface\';\n'
        f'import {{ get{feature_name_pascal}sUseCase }} from \'@/feature/{feature_name_snake}/presentation/di/{entity_name}.di\';\n\n'
        f'export const {entity_name}State = () => {{\n'
        f'    const search = ref<string | null>("");\n'
        f'    const isLoading = ref<boolean>(false);\n'
        f'    const error = ref<string | null>(null);\n'
        f'    const {entity_name}List = ref<I{entity_name_pascal_singular}[]>([]);\n'
        f'    return {{\n'
        f'        error,\n'
        f'        search,\n'
        f'        isLoading,\n'
        f'        {entity_name}List,\n'
        f'    }};\n'
        f'}};\n\n'
        f'export type I{entity_name_pascal_singular}State = ReturnType<typeof {entity_name}State>;\n\n'
        f'export const {entity_name}ViewModel = defineStore(\'{entity_name}Store\', () => {{\n'
        f'    const state = {entity_name}State();\n\n'
        f'    const get{feature_name_pascal} = async (query?: string) => {{\n'
        f'        state.isLoading.value = true;\n'
        f'        state.error.value = null;\n'
        f'        const result = await get{feature_name_pascal}sUseCase.call(query);\n'
        f'        fold(\n'
        f'            (err: string) => {{ state.error.value = err; state.{entity_name}List.value = []; }},\n'
        f'            (data: I{entity_name_pascal_singular}[]) => {{ state.{entity_name}List.value = data; }}\n'
        f'        )(result);\n'
        f'        state.isLoading.value = false;\n'
        f'    }};\n\n'
        f'    get{feature_name_pascal}();\n\n'
        f'    return {{\n'
        f'        ...state,\n'
        f'        get{feature_name_pascal},\n'
        f'    }};\n'
        f'}});\n'
    )

    # Presentation/DI
    di_content = (
        f'// presentation/di/{entity_name}.di.ts\n'
        f'import {{ {entity_name_pascal_singular}RepositoryImpl }} from \'@/feature/{feature_name_snake}/data/repository/{entity_name}.repository.impl\';\n'
        f'import {{ {entity_name_pascal_singular}RemoteDatasource }} from \'@/feature/{feature_name_snake}/data/datasources/{entity_name}.remote.datasource\';\n'
        f'import {{ {entity_name_pascal_singular}LocalDatasource }} from \'@/feature/{feature_name_snake}/data/datasources/{entity_name}.local.datasource\';\n'
        f'import {{ Get{feature_name_pascal}sUseCase }} from \'@/feature/{feature_name_snake}s/domain/usecase/get_{entity_name}.usecase\';\n'
        f'import type {{ I{entity_name_pascal_singular}Repository }} from \'@/feature/{feature_name_snake}/domain/repository/{entity_name}.repository\';\n\n'
        f'// 1. Inisiasi Datasource\n'
        f'const {entity_name}RemoteDataSource = new {entity_name_pascal_singular}RemoteDatasource();\n'
        f'const {entity_name}LocalDataSource = new {entity_name_pascal_singular}LocalDatasource();\n\n'
        f'// 2. Inisiasi Repository\n'
        f'const {entity_name}Repository: I{entity_name_pascal_singular}Repository = new {entity_name_pascal_singular}RepositoryImpl(\n'
        f'   {entity_name}RemoteDataSource,\n'
        f'   {entity_name}LocalDataSource,\n'
        f');\n\n'
        f'// 3. Inisiasi Use Cases\n'
        f'export const get{feature_name_pascal}sUseCase = new Get{feature_name_pascal}sUseCase({entity_name}Repository);\n'
        f'// export const delete{feature_name_pascal}UseCase = new Delete{feature_name_pascal}UseCase({entity_name}Repository);\n'
    )

    # Utilitas Router
    router_content = (
        f'// util/{entity_name}.router.ts\n'
        f'import type {{ RouteRecordRaw }} from \'vue-router\';\n\n'
        f'const {entity_name}Routes: Array<RouteRecordRaw> = [\n'
        f'   {{\n'
        f'      path: \'/{feature_name_url}\',\n'
        f'      name: \'{feature_name_pascal}\',\n'
        f'      component: () => import(\'@/feature/{feature_name_snake}/presentation/view/{entity_name}.view.vue\'),\n'
        f'      meta: {{ title: \'{feature_name_pascal} List\' }},\n'
        f'   }},\n'
        f'];\n\n'
        f'export default {entity_name}Routes;\n'
    )

    # View Content
    view_content = (
        f'<template>\n'
        f'  <div class="row">\n'
        f'    <div class="col-md-12">\n'
        f'      <h1>{feature_name_pascal}</h1>\n'
        f'      <p>Ini adalah view utama untuk fitur <b>{feature_name_pascal}</b> (Entitas: <b>{entity_name_pascal_singular}</b>).</p>\n'
        f'      <p>Silakan gunakan <code class="text-danger">{entity_name}.vm.ts</code> untuk logika bisnis.</p>\n'
        f'    </div>\n'
        f'  </div>\n'
        f'</template>\n\n'
        f'<script setup lang="ts">\n'
        f'import {{ storeToRefs }} from "pinia";\n'
        f'import "@/feature/{feature_name_snake}/presentation/style/{entity_name}.base.css";\n'
        f'import HeaderView from "@/core/presentation/view/component/header.view.vue";\n'
        f'import {{ {entity_name}ViewModel }} from "@/feature/{feature_name_snake}/presentation/view_model/{entity_name}.vm";\n\n'
        f'const store = {entity_name}ViewModel();\n'
        f'const vm = storeToRefs(store);\n'
        f'const state = store;\n'
        f'</script>\n'
    )

    # Remote Data Source Content
    remote_data_source_content = (
        f'// data/datasources/{entity_name}.remote.datasource.ts\n'
        f'import type {{ Either,  left, right }} from \'fp-ts/Either\';\n'
        f'import axiosCustom, {{ isAxiosError }} from "@/core/util/axios_custom";\n'
        f'import {{\n'
        f'      {entity_name_pascal_singular}Response,\n'
        f'      type I{entity_name_pascal_singular}Response\n'
        f'}} from "@/feature/{feature_name_snake}/domain/response/{entity_name}.response";\n\n'
        f'export type {entity_name_pascal_singular}FetchResult = Either<string, I{entity_name_pascal_singular}Response>;\n\n'
        f'export class {entity_name_pascal_singular}RemoteDatasource {{\n'
        f'   async fetch{feature_name_pascal}(query?: string): Promise<{entity_name_pascal_singular}FetchResult> {{\n'
        f'      try {{\n'
        f'         const response = await axiosCustom.get("/{entity_name_jamak}", {{ params: {{ search: query }} }});\n\n'
        f'         if (!response.data) {{\n'
        f'            return left(`Response body kosong`);\n'
        f'         }}\n\n'
        f'         const transformed = {entity_name_pascal_singular}Response.fromServer(response.data);\n\n'
        f'         if (!transformed?.data?.{entity_name_jamak}) {{\n'
        f'            return left(`Data hasil transformasi tidak valid: array {entity_name_jamak} hilang`);\n'
        f'         }}\n\n'
        f'         return right(transformed);\n'
        f'      }} catch (error: unknown) {{\n'
        f'         if (isAxiosError(error)) {{\n'
        f'            const status = error.response?.status;\n'
        f'            const message = error.response?.data?.message || error.message;\n'
        f'            return left(`HTTP ${{status || "??"}}: ${{message}}`);\n'
        f'         }}\n'
        f'         return left(`Unexpected: ${{error instanceof Error ? error.message : String(error)}}`);\n'
        f'      }}\n'
        f'   }}\n'
        f'}}\n'
    )

    # Local Data Source Content
    local_data_source_content = (
        f'// data/datasources/{entity_name}.local.datasource.ts\n'
        f'import type {{ Either }} from \'fp-ts/Either\';\n'
        f'import {{ left, right }} from \'fp-ts/Either\';\n'
        f'import {entity_name}Queries from \'@/feature/{feature_name_snake}/data/datasources/db/{entity_name}.query\';\n'
        f'import type {{ I{entity_name_pascal_singular} }} from \'@/feature/{feature_name_snake}/domain/interfaces/{entity_name}.interface\';\n'
        f'import type {{ I{entity_name_pascal_singular}Response }} from \'@/feature/{feature_name_snake}/domain/response/{entity_name}.response\';\n\n'
        f'export class {entity_name_pascal_singular}LocalDatasource {{\n'
        f'   async get{feature_name_pascal}(query?: string): Promise<Either<string, I{entity_name_pascal_singular}Response>> {{\n'
        f'      try {{\n'
        f'         const data: I{entity_name_pascal_singular}[] = query ? await {entity_name}Queries.getBySearchTerm(query) : await {entity_name}Queries.getAll();\n'
        f'         const response: I{entity_name_pascal_singular}Response = {{\n'
        f'            success: true,\n'
        f'            data: {{\n'
        f'               {entity_name_jamak}: data, // Menggunakan bentuk jamak yang diproses\n'
        f'            }},\n'
        f'            message: `Berhasil mengambil data {entity_name} dari lokal`,\n'
        f'         }};\n'
        f'         return right(response);\n'
        f'      }} catch (error: unknown) {{\n'
        f'         const msg = error instanceof Error ? error.message : String(error);\n'
        f'         return left(`Gagal mengambil data {entity_name} dari lokal: ${{msg}}`);\n'
        f'      }}\n'
        f'   }}\n\n'
        f'   async save{feature_name_pascal}(items: I{entity_name_pascal_singular}[]): Promise<void> {{\n'
        f'      // Logika penyimpanan data (misal: menghapus semua data lama dan memasukkan yang baru)\n'
        f'      // await {entity_name}Queries.deleteAll();\n'
        f'      // await {entity_name}Queries.bulkAdd(items);\n'
        f'   }}\n\n'
        f'   async delete{feature_name_pascal}(): Promise<void> {{\n'
        f'      await {entity_name}Queries.deleteAll();\n'
        f'   }}\n'
        f'}}\n'
    )

    # data access object (DAO) content
    # DB Dao Content
    dao_content = (
        f'// data/datasources/db/{entity_name}.dao.ts\n'
        f'import {{ db }} from \'@/core/data/datasources/db/core.db\';\n'
        f'import type {{ I{entity_name_pascal_singular} }} from \'@/feature/{feature_name_snake}/domain/interfaces/{entity_name}.interface\';\n\n'
        f'const {entity_name}Dao = {{\n'
        f'   // ✅ Get all (including soft-deleted)\n'
        f'   async getAll(): Promise<I{entity_name_pascal_singular}[]> {{\n'
        f'      return await db.{entity_name_jamak}.orderBy(\'name\').toArray();\n'
        f'   }},\n\n'
        f'   // ✅ Get by local id (string UUID)\n'
        f'   async getById(id: string): Promise<I{entity_name_pascal_singular} | undefined> {{\n'
        f'      return await db.{entity_name_jamak}.get(id);\n'
        f'   }},\n\n'
        f'   // ✅ Search by name or address\n'
        f'   async getBySearchTerm(term: string): Promise<I{entity_name_pascal_singular}[]> {{\n'
        f'      return await db.{entity_name_jamak}\n'
        f'          .filter(item =>\n'
        f'              (typeof item?.name === \'string\' && item.name.toLowerCase().includes(term.toLowerCase()))\n'
        f'              // Tambahkan field lain jika perlu, misal address\n'
        f'          )\n'
        f'          .toArray();\n'
        f'   }},\n\n'
        f'   // ✅ Insert or update (upsert)\n'
        f'   async upsert({entity_name}: I{entity_name_pascal_singular}): Promise<string> {{\n'
        f'      if (!{entity_name}.id) {{\n'
        f'          {entity_name}.id = crypto.randomUUID();\n'
        f'      }}\n'
        f'      await db.{entity_name_jamak}.put({entity_name});\n'
        f'      return {entity_name}.id;\n'
        f'   }},\n\n'
        f'   // ✅ Bulk insert banyak data\n'
        f'   async insertAll(items: I{entity_name_pascal_singular}[]): Promise<void> {{\n'
        f'      await db.transaction(\'rw\', db.{entity_name_jamak}, async () => {{\n'
        f'          for (const item of items) {{\n'
        f'              item.id = crypto.randomUUID();\n'
        f'              await db.{entity_name_jamak}.put(item);\n'
        f'          }}\n'
        f'      }});\n'
        f'   }},\n\n'
        f'   // ✅ Hard delete all\n'
        f'   async deleteAll(): Promise<void> {{\n'
        f'      await db.{entity_name_jamak}.clear();\n'
        f'   }},\n'
        f'}};\n\n'
        f'export default {entity_name}Queries;\n'
    )

    # DB Table Content
    table_content = (
        f'// data/datasources/db/{entity_name}.table.ts\n'
        f'const {entity_name}Table = "++id, &id_server, name, created_at, updated_at, deleted_at, synced_at";\n\n'
        f'export {{ {entity_name}Table }};\n'
    )

    # Response Content
    response_content = (
        f'import type {{ I{entity_name_pascal_singular} }} from "@/feature/{feature_name_snake}/domain/interfaces/{entity_name}.interface";\n'
        f'import {{ {entity_name_pascal_singular}Model }} from "@/feature/{feature_name_snake}/domain/interfaces/{entity_name}.interface";\n\n'
        f'export interface I{entity_name_pascal_singular}Response {{\n'
        f'    success: boolean;\n'
        f'    data: I{entity_name_pascal_singular}DataResponse;\n'
        f'    message: string;\n'
        f'}}\n\n'
        f'export interface I{entity_name_pascal_singular}DataResponse {{\n'
        f'    {entity_name_jamak}: I{entity_name_pascal_singular}[];\n'
        f'}}\n\n'
        f'export class {entity_name_pascal_singular}Response {{\n'
        f'    static fromServer(response: I{entity_name_pascal_singular}Response): I{entity_name_pascal_singular}Response {{\n'
        f'        return {{\n'
        f'            success: response.success,\n'
        f'            data: {entity_name_pascal_singular}DataResponse.fromServer(response.data),\n'
        f'            message: response.message,\n'
        f'        }};\n'
        f'    }}\n'
        f'}}\n\n'
        f'export class {entity_name_pascal_singular}DataResponse {{\n'
        f'    static fromServer(data: I{entity_name_pascal_singular}DataResponse): I{entity_name_pascal_singular}DataResponse {{\n'
        f'        return {{\n'
        f'            {entity_name_jamak}: data.{entity_name_jamak}.map(({entity_name}) => {entity_name_pascal_singular}Model.fromServer({entity_name})),\n'
        f'        }};\n'
        f'    }}\n'
        f'}}\n'
    )

    # --- Daftar File yang akan dibuat ---

    files_to_create = {
        # Domain Layer (Menggunakan nama file tunggal)
        os.path.join('domain', 'interfaces', f'{entity_name}.interface.ts'): interface_content,
        os.path.join('domain', 'repositories', f'{entity_name}.repository.ts'): repo_interface_content,
        os.path.join('domain', 'responses', f'{entity_name}.response.ts'): response_content,
        os.path.join('domain', 'usecases', f'get_{entity_name}s.usecase.ts'): usecase_content,

        # Data Layer (Menggunakan nama file tunggal)
        os.path.join('data', 'datasources', f'{entity_name}.local.datasource.ts'): local_data_source_content,
        os.path.join('data', 'datasources', f'{entity_name}.remote.datasource.ts'): remote_data_source_content,
        os.path.join('data', 'datasources', 'db', 'local', f'{entity_name}.dao.ts'): dao_content,
        os.path.join('data', 'datasources', 'db', 'local', f'{entity_name}.table.ts'): table_content,
        os.path.join('data', 'repositories', f'{entity_name}.repository.impl.ts'): repo_impl_content,
        # Presentation Layer (Menggunakan nama file tunggal)
        os.path.join('presentation', 'view_models', f'{entity_name}.vm.ts'): vm_content,
        os.path.join('presentation', 'di', f'{entity_name}.di.ts'): di_content,
        os.path.join('presentation', 'styles', f'{entity_name}.base.css'): f'/* presentation/styles/{entity_name}.base.css */\n/* Gaya dasar untuk komponen {entity_name_pascal_singular} */\n',
        os.path.join('presentation', 'views', 'page', f'{entity_name}.view.vue'): view_content,
        os.path.join('presentation', 'views', 'component'),
        os.path.join('presentation', 'services', f'{entity_name}.service.ts'): f'// presentation/services/{entity_name}.service.ts\n',

        # Utility Layer (Menggunakan nama file tunggal)
        os.path.join('util', f'{entity_name}.router.ts'): router_content,
    }

    return files_to_create


# --- 4. Fungsi Koordinasi Utama ---

def create_feature_structure(feature_name):
    """
    Fungsi utama untuk membuat struktur direktori dan file untuk fitur baru.
    """
    # 1. Normalisasi dan Penamaan
    feature_name_snake = feature_name.lower().replace('-', '_').strip()
    feature_name_url = feature_name_snake.replace("_", "-")

    entity_name, feature_name_pascal = get_entity_name_and_pascal(feature_name_snake)
    entity_name_pascal_singular = to_pascal_case(entity_name)
    entity_name_jamak = get_entity_name_plural_snake(entity_name)

    naming = {
        'entity_name': entity_name,
        'entity_name_pascal_singular': entity_name_pascal_singular,
        'feature_name_snake': feature_name_snake,
        'feature_name_pascal': feature_name_pascal,
        'feature_name_url': feature_name_url,
        'entity_name_jamak': entity_name_jamak,
    }

    # 2. Definisikan jalur utama
    base_dir = os.path.join('src', 'feature')
    feature_dir = os.path.join(base_dir, feature_name_snake)

    # 3. Buat/Periksa Direktori Fitur Utama
    print("\n" + "="*50)
    print(f"Feature: **{feature_name_pascal}** (Entitas: **{entity_name_pascal_singular}**)")
    print("="*50)

    if os.path.exists(feature_dir):
        print(f"Peringatan: Direktori fitur '{feature_dir}' sudah ada. (Mode Idempoten)")
    else:
        os.makedirs(feature_dir, exist_ok=True)
        print(f"Membuat direktori fitur baru: {feature_dir}")

    # 4. Buat Struktur Direktori (Warehouse)
    print("\nMembuat atau memeriksa direktori...")
    if not _create_subdirectories(feature_dir):
        return

    # 5. Dapatkan Konten File
    files_to_create = _generate_placeholder_content(naming)

    # 6. Buat File-file Placeholder
    print("\nMembuat atau memeriksa file...")
    _create_placeholder_files(feature_dir, files_to_create)

    # 7. Selesai
    print("\n" + "="*50)
    print(f"Feature '{feature_name_snake}' berhasil dipastikan strukturnya.")
    print(f"-> Lokasi: {os.path.abspath(feature_dir)}")
    print("="*50)

def _create_subdirectories(feature_dir):
    """
    Membuat sub-direktori berdasarkan konfigurasi.
    """
    try:
        for sub_dir in FEATURE_STRUCTURE:
            path = os.path.join(feature_dir, sub_dir)
            os.makedirs(path, exist_ok=True)
            print(f"   Direktori OK: {path}")
        return True
    except Exception as e:
        print(f"❌ Terjadi error saat membuat direktori: {e}")
        return False

def _create_placeholder_files(feature_dir, files_to_create):
    """
    Membuat file-file placeholder dengan konten yang sesuai.
    """
    for file_path, content in files_to_create.items():
        full_path = os.path.join(feature_dir, file_path)

        # Cek apakah file sudah ada, jika ya, lewati.
        if os.path.exists(full_path):
            print(f"   Dilewati: {full_path} (Sudah ada)")
            continue

        try:
            # Pastikan direktori file ada (jika belum dibuat di langkah _create_subdirectories)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"   Dibuat: {full_path}")
        except Exception as e:
            print(f"❌ Error saat membuat file {full_path}: {e}")

# --- 5. Eksekusi Utama (SAMA) ---

if __name__ == "__main__":
    if len(sys.argv) > 1:
        feature_name = sys.argv[1]
    else:
        print("---------------------------------------------------------")
        print("Feature Generator (Clean Architecture/DDD - Vue.js)")
        print("---------------------------------------------------------")
        feature_name = input("Masukkan nama fitur baru (cth: order_history, user): ").strip()

    if feature_name:
        create_feature_structure(feature_name)
    else:
        print("Nama fitur tidak boleh kosong. Proses dibatalkan.")
