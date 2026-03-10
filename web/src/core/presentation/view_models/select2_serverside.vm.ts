import { reactive, computed } from 'vue';

export interface Select2ServerSideVMProps {
    getData: (params: { search: string }) => Promise<any[]>;
    onSelect?: (value: any) => void;
}

export interface Select2ServerSideVM {
    options: any[];
    loading: boolean;
    search: (query?: string) => Promise<void>;
    onSearch: (searchQuery: string, loadingFn: (b: boolean) => void) => Promise<void>;
    ensureOption: (option: any) => void;
}

export function createSelect2ServerSideVM(props: Select2ServerSideVMProps): Select2ServerSideVM {
    const state = reactive({
        options: [] as any[],
        loading: false,
        searchQuery: '',
    });

    async function search(query: string = '') {
        state.searchQuery = query;
        state.loading = true;
        try {
            state.options = await props.getData({ search: query });
        } catch (error) {
            console.error('Select2 Fetch Error:', error);
            state.options = [];
        } finally {
            state.loading = false;
        }
    }

    async function onSearch(searchQuery: string, loadingFn: (b: boolean) => void) {
        loadingFn(true);
        await search(searchQuery);
        loadingFn(false);
    }

    function ensureOption(option: any) {
        if (!option || option.id === undefined || option.id === null) {
            return;
        }

        const exists = state.options.some((item) => item?.id == option.id);
        if (!exists) {
            state.options = [...state.options, option];
        }
    }

    // Return a reactive object where computeds are automatically unwrapped
    return reactive({
        options: computed(() => state.options),
        loading: computed(() => state.loading),
        search,
        onSearch,
        ensureOption
    }) as any as Select2ServerSideVM;
}
