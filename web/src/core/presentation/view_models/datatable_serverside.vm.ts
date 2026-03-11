import { computed, ref } from 'vue';
import type { Ref } from 'vue';

export interface DataTableServerSideVM<T extends Record<string, any>> {
  items: T[];
  loading: boolean;
  search: string;
  offset: number;
  limit: number;
  totalItems: number;
  fields: any[];
  fetchData: () => Promise<void>;
  clearItems: () => void;

  // UI-related logic moved from component
  limitOptions: number[];
  totalPages: number;
  currentPage: number;
  pageNumbers: (number | string)[];
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  changePage: (page: number) => void;
  searchData: () => void;
}

export interface FetchResult<T> {
  items: T[];
  total: number;
}

const DEFAULT_TABLE_LIMIT = 5;

export function createDataTableServerSideVM<T extends Record<string, any>>(
  onFetch: (params: { search: string; offset: number; limit: number }) => Promise<FetchResult<T>>,
  fields: any[] = []
): DataTableServerSideVM<T> {
  const items = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const search = ref('');
  const offset = ref(0);
  const limit = ref(DEFAULT_TABLE_LIMIT);
  const totalItems = ref(0);

  const fetchData = async () => {
    loading.value = true;
    try {
      const result = await onFetch({
        search: search.value,
        offset: offset.value,
        limit: limit.value,
      });
      items.value = result.items;
      totalItems.value = result.total;
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      loading.value = false;
    }
  };

  const limitOptions = computed(() => {
    const standards = [5, 10, 25, 50, 100];
    const options = new Set<number>();
    standards.forEach((s) => {
      if (s < totalItems.value) options.add(s);
    });
    if (totalItems.value > 0) options.add(totalItems.value);
    options.add(limit.value);
    if (options.size === 0) options.add(DEFAULT_TABLE_LIMIT);
    return Array.from(options).sort((a, b) => a - b);
  });

  const setLimit = (value: number) => {
    const nextLimit =
      Number.isFinite(value) && value > 0 ? Math.trunc(value) : DEFAULT_TABLE_LIMIT;
    limit.value = nextLimit;
  };

  const setSearch = (value: string) => {
    search.value = value;
  };

  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / limit.value) || 1));
  const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);

  const pageNumbers = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      if (!pages.includes(total)) pages.push(total);
    }
    return pages;
  });

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return;
    offset.value = (page - 1) * limit.value;
    fetchData();
  };

  const clearItems = () => {
    items.value = [];
  };

  const searchData = () => {
    offset.value = 0;
    fetchData();
  };

  return {
    items: items as any,
    loading: loading as any,
    search: search as any,
    offset: offset as any,
    limit: limit as any,
    totalItems: totalItems as any,
    fields,
    fetchData,
    clearItems,
    limitOptions: limitOptions as any,
    totalPages: totalPages as any,
    currentPage: currentPage as any,
    pageNumbers: pageNumbers as any,
    setLimit,
    setSearch,
    changePage,
    searchData,
  } as DataTableServerSideVM<T>;
}
