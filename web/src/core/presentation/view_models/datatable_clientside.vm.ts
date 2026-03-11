import { computed, reactive, ref } from 'vue';
import type { Ref } from 'vue';

export interface DataTableClientSideVM<T extends Record<string, any>> {
  // Current page items
  items: T[];
  loading: boolean;
  search: string;
  offset: number;
  limit: number;
  totalItems: number;
  fields: any[];

  // Actions
  setItems: (data: T[]) => void;
  fetchData: () => void; // Recalculates view
  clearItems: () => void;

  // UI State
  limitOptions: number[];
  totalPages: number;
  currentPage: number;
  pageNumbers: (number | string)[];
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  changePage: (page: number) => void;
  searchData: () => void;
}

const DEFAULT_TABLE_LIMIT = 5;

export function createDataTableClientSideVM<T extends Record<string, any>>(
  fields: any[] = [],
  initialItems: T[] = []
): DataTableClientSideVM<T> {
  const allItems = ref<T[]>([...initialItems]) as Ref<T[]>;
  const items = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const search = ref('');
  const offset = ref(0);
  const limit = ref(DEFAULT_TABLE_LIMIT);
  const totalItems = ref(0);

  // Internal helper to apply filter and pagination
  const refreshView = () => {
    let result = allItems.value;

    // 1. Filter
    if (search.value) {
      const query = search.value.toLowerCase();
      result = result.filter((item) => {
        return Object.values(item).some((val) => String(val).toLowerCase().includes(query));
      });
    }

    totalItems.value = result.length;

    // 2. Paginate
    const start = offset.value;
    const end = start + limit.value;
    items.value = result.slice(start, end);
  };

  const setItems = (data: T[]) => {
    allItems.value = data;
    offset.value = 0; // Reset to first page on new data
    refreshView();
  };

  const fetchData = () => {
    // In client-side, fetchData is just refreshing the view based on current state
    refreshView();
  };

  const limitOptions = computed(() => {
    const standards = [5, 10, 25, 50, 100];
    const options = new Set<number>();

    standards.forEach((size) => {
      if (size < totalItems.value) {
        options.add(size);
      }
    });

    if (totalItems.value > 0) {
      options.add(totalItems.value);
    }

    options.add(limit.value);

    if (options.size === 0) {
      options.add(DEFAULT_TABLE_LIMIT);
    }

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

  const totalPages = computed(() => Math.ceil(totalItems.value / limit.value) || 1);
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
    refreshView();
  };

  const clearItems = () => {
    allItems.value = [];
    refreshView();
  };

  const searchData = () => {
    offset.value = 0;
    refreshView();
  };

  // Initial load
  if (initialItems.length > 0) {
    refreshView();
  }

  const vm = reactive({
    items,
    loading,
    search,
    offset,
    limit,
    totalItems,
    fields,
    setItems,
    fetchData,
    clearItems,
    limitOptions,
    totalPages,
    currentPage,
    pageNumbers,
    setLimit,
    setSearch,
    changePage,
    searchData,
  });

  return vm as DataTableClientSideVM<T>;
}
