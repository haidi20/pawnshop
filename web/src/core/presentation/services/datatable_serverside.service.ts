import { createDataTableServerSideVM } from '@/core/presentation/view_models/datatable_serverside.vm';
import type {
  DataTableServerSideVM,
  FetchResult,
} from '@/core/presentation/view_models/datatable_serverside.vm';
import { isRef } from 'vue';
import type { ComputedRef, Ref } from 'vue';

export class DataTableServerSideService<T extends Record<string, any>> {
  public vm: DataTableServerSideVM<T>;

  constructor(
    onFetch: (params: { search: string; offset: number; limit: number }) => Promise<FetchResult<T>>,
    fields: any[] = []
  ) {
    this.vm = createDataTableServerSideVM(onFetch, fields);
  }

  // Helper untuk unwrap ref value
  private unwrap<V>(value: V | Ref<V>): V {
    return isRef(value) ? value.value : value;
  }

  // === Raw Refs untuk reaktivitas (gunakan di VM return untuk storeToRefs) ===
  get itemsRef(): Ref<T[]> {
    return (this.vm as any).items;
  }
  get loadingRef(): Ref<boolean> {
    return (this.vm as any).loading;
  }
  get searchRef(): Ref<string> {
    return (this.vm as any).search;
  }
  get offsetRef(): Ref<number> {
    return (this.vm as any).offset;
  }
  get limitRef(): Ref<number> {
    return (this.vm as any).limit;
  }
  get totalItemsRef(): Ref<number> {
    return (this.vm as any).totalItems;
  }

  // === Computed Refs untuk pagination (reaktif) ===
  get totalPagesRef(): ComputedRef<number> {
    return this.vm.totalPages as unknown as ComputedRef<number>;
  }
  get currentPageRef(): ComputedRef<number> {
    return this.vm.currentPage as unknown as ComputedRef<number>;
  }
  get pageNumbersRef(): ComputedRef<(number | string)[]> {
    return this.vm.pageNumbers as unknown as ComputedRef<(number | string)[]>;
  }
  get limitOptionsRef(): ComputedRef<number[]> {
    return this.vm.limitOptions as unknown as ComputedRef<number[]>;
  }

  // === Unwrapped getters (untuk akses langsung di dalam VM logic) ===
  get items(): T[] {
    return this.unwrap(this.vm.items as any);
  }
  set items(value: T[]) {
    const vmItems = (this.vm as any).items;
    if (isRef(vmItems)) {
      vmItems.value = value;
    } else {
      (this.vm as any).items = value;
    }
  }

  get loading(): boolean {
    return this.unwrap(this.vm.loading as any);
  }
  set loading(value: boolean) {
    const vmLoading = (this.vm as any).loading;
    if (isRef(vmLoading)) {
      vmLoading.value = value;
    } else {
      (this.vm as any).loading = value;
    }
  }

  get search(): string {
    return this.unwrap(this.vm.search as any);
  }
  set search(value: string) {
    const vmSearch = (this.vm as any).search;
    if (isRef(vmSearch)) {
      vmSearch.value = value;
    } else {
      (this.vm as any).search = value;
    }
  }

  get offset(): number {
    return this.unwrap(this.vm.offset as any);
  }
  set offset(value: number) {
    const vmOffset = (this.vm as any).offset;
    if (isRef(vmOffset)) {
      vmOffset.value = value;
    } else {
      (this.vm as any).offset = value;
    }
  }

  get limit(): number {
    return this.unwrap(this.vm.limit as any);
  }
  get totalItems(): number {
    return this.unwrap(this.vm.totalItems as any);
  }
  get fields() {
    return this.vm.fields;
  }

  get limitOptions() {
    return this.unwrap(this.vm.limitOptions as any);
  }
  get totalPages() {
    return this.unwrap(this.vm.totalPages as any);
  }
  get currentPage() {
    return this.unwrap(this.vm.currentPage as any);
  }
  get pageNumbers() {
    return this.unwrap(this.vm.pageNumbers as any);
  }

  fetchData() {
    return this.vm.fetchData();
  }

  changePage(page: number) {
    this.vm.changePage(page);
  }

  searchData() {
    this.vm.searchData();
  }

  clearItems() {
    this.vm.clearItems();
  }
}
