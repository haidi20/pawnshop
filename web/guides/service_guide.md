# Panduan Layanan Event Bus

## Deskripsi
Terdapat 2 cara service dan event bus

## Berkas: `services/eventBus.ts`
Panduan ini menjelaskan implementasi event bus yang type-safe menggunakan TypeScript untuk proyek Anda. Hubungan antar view model dengan view model secara langsung

```typescript
import { EventEmitter } from 'events';

// Definisikan tipe event secara ketat dengan TypeScript
type DomainEvents = {
    'customer:selectedForEdit': (customer: Customer) => void;
    // ... event lainnya
};

// Gunakan Node.js EventEmitter atau implementasi sederhana
export const eventBus = new EventEmitter() as {
    on: <K extends keyof DomainEvents>(event: K, listener: DomainEvents[K]) => void;
    emit: <K extends keyof DomainEvents>(event: K, ...args: Parameters<DomainEvents[K]>) => boolean;
};
```

## Poin Penting

- **Type Safety:** Tipe `DomainEvents` memastikan hanya event dan payload yang sudah didefinisikan yang dapat digunakan.
- **Contoh Penggunaan:**
    ```typescript
    eventBus.on('customer:selectedForEdit', (customer) => {
        // menangani edit customer
    });

    eventBus.emit('customer:selectedForEdit', someCustomerObject);
    ```
- **Mudah Dikembangkan:** Tambahkan event baru ke `DomainEvents` sesuai kebutuhan.

## Manfaat

- Mencegah error saat runtime akibat nama event atau payload yang salah.
- Meningkatkan maintainability dan keterbacaan kode.



Baik, jika Anda ingin mempertahankan nama **Service** (dan bukan Composable atau Usecase) untuk fungsi koordinasi Anda (`onShowProductsPage` dan `setProducts`), tetapi ingin arsitekturnya tetap bersih dan terstruktur, berikut adalah revisi dan pemikiran tentang tanggung jawab *Service* tersebut.

### 📝 Revisi Konsep dan Tanggung Jawab Service

Kita akan mendefinisikan **Service ini sebagai "Application Service" atau "Coordinator"** di lapisan Presentasi (bukan Data atau Domain), yang bertanggung jawab untuk mengorkestrasi beberapa VM/Store.

#### Perubahan yang Harus Dilakukan:

1.  **Hapus Ketergantungan Domain yang Tidak Perlu:** Hapus *dependency* `fp-ts/lib/Either`. Penggunaan `Either` menyiratkan *error handling* yang ketat ala Domain Layer, padahal *Service* ini berada di lapisan Presentasi. Biarkan *error handling* sederhana (gunakan `try...catch` dan *throw* `Error` standar jika perlu, atau delegasikan ke VM).
2.  **Jadikan Kelas (Disarankan):** Mengubah fungsi menjadi kelas adalah *best practice* untuk *Service* (Singleton/DI) karena memungkinkan *dependency injection* yang lebih mudah (meskipun Pinia membuatnya lebih mudah dengan `ref.read()` atau `useStore()`).
3.  **Pisahkan Tanggung Jawab:** Pastikan Service ini hanya mengkoordinasikan **aksi VM**, dan bukan **logika bisnis inti** (yang seharusnya berada di Usecase/Domain).

### 💻 Revisi Kode

Berikut adalah revisi kode Anda, mempertahankan nama **Service** dan fungsinya:

#### 1\. Buat Interface untuk Kejelasan (Optional, tetapi Disarankan)

```typescript
// feature/product/application/interfaces/product_coordinator.interface.ts
import { type IProduct } from "@/feature/product/domain/interface/product.interface";
import { type IInitialOrderOptions } from "@/feature/warehouse/domain/interfaces/order_option.interface";

export interface IParamOnShowProductsPage {
    mode: IInitialOrderOptions,
    warehouseId: number | null,
}

export interface IProductCoordinatorService {
    onShowProductsPage(params: IParamOnShowProductsPage): Promise<void>;
    setProducts(products: IProduct[]): Promise<void>;
}
```

#### 2\. Implementasi Service (Coordinator)

Kita ganti fungsi global Anda dengan kelas Service.

```typescript
// feature/product/application/services/product.coordinator.service.ts

import { productViewModel } from "@/feature/product/presentation/view_models/product.vm";
import { transactionViewModel } from "@/feature/transaction/presentation/view_models/transaction.vm";
import { type IProduct } from "@/feature/product/domain/interface/product.interface";
import { IParamOnShowProductsPage, IProductCoordinatorService } from "../interfaces/product_coordinator.interface";

// Kelas Service/Coordinator yang bertanggung jawab mengkoordinasikan VM
export class ProductCoordinatorService implements IProductCoordinatorService {

    // --- Instansi Service sebagai Singleton ---
    private static instance: ProductCoordinatorService;
    public static getInstance(): ProductCoordinatorService {
        if (!ProductCoordinatorService.instance) {
            ProductCoordinatorService.instance = new ProductCoordinatorService();
        }
        return ProductCoordinatorService.instance;
    }
    // ----------------------------------------

    // Fungsi yang mengkoordinasikan pemanggilan dua VM
    public async onShowProductsPage({
        mode,
        warehouseId,
    }: IParamOnShowProductsPage): Promise<void> {
        try {
            // 1. Ambil instance VM/Store
            const productVm = productViewModel();
            const transactionVm = transactionViewModel();

            // 2. Koordinasi Aksi VM (VM harus memiliki aksi/method yang diekspos)

            // Set params dan panggil aksi pemuatan di VM Produk
            productVm.setParams({
                mode: mode,
                warehouseId: warehouseId,
            });
            await productVm.getProducts(); // Asumsi getProducts memanggil Usecase/Repo

            // Set params di VM Transaksi
            transactionVm.setParams({
                mode: mode,
                warehouseId: warehouseId,
            });

            // Tidak perlu return right(undefined); karena tidak menggunakan Either
        } catch (error) {
            // Lempar error untuk ditangkap di lapisan Presentasi/UI
            console.error("ProductCoordinatorService failed:", error);
            throw new Error(`Failed to initialize product page: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Fungsi transfer data sederhana antar VM (contoh setProducts)
    public async setProducts({
        products,
    }: {
        products: IProduct[],
    }): Promise<void> {
        try {
            const productVm = productViewModel();
            await productVm.setProductList(products);
            // return true; (Tidak perlu return Either/boolean)
        } catch (error) {
            console.error("ProductCoordinatorService failed to set products:", error);
            throw new Error(`Failed to update products state: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

// Ekspor instance singleton untuk kemudahan penggunaan
export const productCoordinatorService = ProductCoordinatorService.getInstance();
```

#### 3\. Cara Penggunaan di Komponen Vue/Router

Sekarang, Komponen Vue atau *router guard* Anda memanggil Service ini:

```typescript
// Component Vue / Router Guard
import { productCoordinatorService } from "@/feature/product/application/services/product.coordinator.service";

async function loadPage() {
    try {
        await productCoordinatorService.onShowProductsPage({
            mode: 'CREATE',
            warehouseId: 10,
        });
        // Lanjut ke halaman...
    } catch (error) {
        // Tampilkan error ke pengguna
        alert(error.message);
    }
}
```

### 🏆 Kesimpulan

Dengan mempertahankan nama **Service** dan menggunakannya sebagai **Application Service/Coordinator** yang mengkoordinasikan **aksi VM** dari lapisan Presentasi, Anda telah mencapai tujuan Anda:

1.  **Nama Service Tetap:** `ProductCoordinatorService`.
2.  **Hubungan Langsung VM-VM:** Service menjadi **perantara sah** yang mengimpor dan memanggil VM (`productViewModel()`, `transactionViewModel()`).
3.  **Struktur Lebih Bersih:** Penghapusan `Either` dan penggunaan kelas *Service* membuat kodenya lebih sesuai dengan peran Application Service.

```
