import { createSelect2ServerSideVM, Select2ServerSideVMProps } from '@/core/presentation/view_models/select2_serverside.vm';

export class Select2ServerSideService {
    private vm;

    constructor(props: Select2ServerSideVMProps) {
        this.vm = createSelect2ServerSideVM(props);
    }

    get options() {
        return this.vm.options;
    }

    get loading() {
        return this.vm.loading;
    }

    async search(query?: string) {
        return this.vm.search(query);
    }

    async onSearch(searchQuery: string, loadingFn: (b: boolean) => void) {
        return this.vm.onSearch(searchQuery, loadingFn);
    }
}
