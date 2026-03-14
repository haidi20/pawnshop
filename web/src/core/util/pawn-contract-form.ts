import type { EnumOptionModel } from '@core/domain/models/enum-option.model';
import {
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';

/**
 * Pilihan durasi gadai (Tenor).
 */
export const pawnContractTermOptions: Array<EnumOptionModel<PawnContractTermDaysEnum>> = [
    { value: PawnContractTermDaysEnum.Seven, label: '7 hari', helper: 'Cocok untuk gadai singkat.' },
    { value: PawnContractTermDaysEnum.Fifteen, label: '15 hari', helper: 'Pilihan menengah untuk kebutuhan cepat.' },
    { value: PawnContractTermDaysEnum.Thirty, label: '30 hari', helper: 'Pilihan paling umum untuk gadai baru.' },
    { value: PawnContractTermDaysEnum.Sixty, label: '60 hari', helper: 'Dipakai untuk tenor lebih panjang.' }
];

/**
 * Pilihan skema pembayaran biaya titip.
 */
export const pawnContractPaymentOptions: Array<EnumOptionModel<PawnContractPaymentOptionDaysEnum>> = [
    { value: PawnContractPaymentOptionDaysEnum.Daily, label: 'Harian', helper: 'Biaya titip dihitung per hari.' },
    { value: PawnContractPaymentOptionDaysEnum.Weekly, label: 'Per 7 hari', helper: 'Biaya titip dihitung per minggu.' },
    {
        value: PawnContractPaymentOptionDaysEnum.FifteenDays,
        label: 'Per 15 hari',
        helper: 'Biaya titip dihitung per 15 hari.'
    }
];

/**
 * Pilihan jenis identitas nasabah.
 */
export const pawnContractIdentityOptions: Array<EnumOptionModel<PawnContractIdentityTypeEnum>> = [
    { value: PawnContractIdentityTypeEnum.Ktp, label: 'KTP' },
    { value: PawnContractIdentityTypeEnum.Sim, label: 'SIM' },
    { value: PawnContractIdentityTypeEnum.Kk, label: 'KK' }
];

/**
 * Formatter tanggal standar Indonesia.
 */
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
});

/**
 * Formatter mata uang Rupiah.
 */
const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
});

/**
 * Menormalkan input tanggal ke format ISO (YYYY-MM-DD).
 */
const normalizeDateInput = (value: string): string => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
};

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD.
 */
export const getTodayDateValue = (): string => new Date().toISOString().slice(0, 10);

/**
 * Menghitung tanggal jatuh tempo berdasarkan tanggal kontrak dan durasi hari.
 */
export const calculatePawnContractMaturityDate = (contractDate: string, termDays: number): string => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(contractDate)) {
        return getTodayDateValue();
    }

    const [year, month, day] = contractDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + termDays);
    return date.toISOString().slice(0, 10);
};

/**
 * Mengubah string tanggal YYYY-MM-DD menjadi format yang mudah dibaca (Harian Indonesia).
 */
export const formatDateForHumans = (value: string): string => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return '-';
    }

    return dateFormatter.format(new Date(`${value}T00:00:00`));
};

/**
 * Memformat angka menjadi string mata uang Rupiah.
 */
export const formatCurrencyForHumans = (value: number): string => currencyFormatter.format(value);

/**
 * Mendapatkan daftar skema pembayaran yang valid berdasarkan durasi gadai.
 * Logika: Jika tenor hanya 7 hari, maka pilihan "Per 15 hari" ditiadakan.
 */
export const getAvailablePawnContractPaymentOptions = (
    termDays: number,
    itemKind?: string
): Array<EnumOptionModel<PawnContractPaymentOptionDaysEnum>> =>
    pawnContractPaymentOptions.filter((option) => {
        // Aturan 1: Kendaraan tidak boleh harian
        if (itemKind === PawnContractItemKindEnum.Vehicle && option.value === PawnContractPaymentOptionDaysEnum.Daily) {
            return false;
        }

        // Aturan 2: Jika tenor hanya 7 hari, maka pilihan "Per 15 hari" ditiadakan
        if (termDays === PawnContractTermDaysEnum.Seven && option.value === PawnContractPaymentOptionDaysEnum.FifteenDays) {
            return false;
        }

        return true;
    });

/**
 * Menghitung batas maksimal periode pembayaran di muka (prepaid) yang diizinkan.
 * Logika ini mencegah nasabah membayar melebihi durasi kontrak yang tersedia
 * atau melebihi batas kebijakan bisnis (misal: harian maksimal 15 hari).
 */
export const getPawnContractPrepaidStorageMax = (termDays: number, paymentOptionDays: number): number => {
    // KONDISI 1: Tenor Singkat (7 Hari)
    if (termDays === PawnContractTermDaysEnum.Seven) {
        // - Jika skema Harian (Daily): Bisa bayar maksimal 7 hari (full tenor).
        // - Jika skema Mingguan (Weekly): Hanya ada 1 periode dalam 7 hari.
        return paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily ? 7 : 1;
    }

    // KONDISI 2: Tenor Menengah (15 Hari)
    if (termDays === PawnContractTermDaysEnum.Fifteen) {
        if (paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily) {
            // Bisa bayar maksimal 15 hari (full tenor).
            return 15;
        }

        // - Jika skema Mingguan (7 hari): 15 / 7 = 2 periode penuh.
        // - Jika skema 15 hari: Hanya ada 1 periode.
        return paymentOptionDays === PawnContractPaymentOptionDaysEnum.Weekly ? 2 : 1;
    }

    // KONDISI 3: Tenor Standar (30 Hari)
    if (termDays === PawnContractTermDaysEnum.Thirty) {
        if (paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily) {
            // Batas kebijakan: Walaupun tenor 30 hari, bayar di muka harian dibatasi maksimal 15 hari.
            // return 15;
            return 30;
        }

        // - Jika skema Mingguan (7 hari): 30 / 7 = 4 periode (dengan sisa 2 hari abaikan).
        // - Jika skema 15 hari: 30 / 15 = 2 periode pas.
        return paymentOptionDays === PawnContractPaymentOptionDaysEnum.Weekly ? 4 : 2;
    }

    // KONDISI 4: Tenor Panjang (60 Hari)
    if (termDays === PawnContractTermDaysEnum.Sixty) {
        if (paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily) {
            // Tetap dibatasi maksimal 15 hari untuk skema harian agar tidak terlalu berat di depan.
            return 15;
        }

        // - Jika skema Mingguan (7 hari): 60 / 7 = 8.57, dibulatkan ke 9 periode sesuai kebijakan pembulatan atas.
        // - Jika skema 15 hari: 60 / 15 = 4 periode pas.
        return paymentOptionDays === PawnContractPaymentOptionDaysEnum.Weekly ? 9 : 4;
    }

    return 0;
};

/**
 * Mendapatkan daftar angka (array) untuk opsi jumlah periode bayar di muka (misal: [0, 1, 2, 3, 4]).
 */
export const getPawnContractPrepaidStorageOptions = (termDays: number, paymentOptionDays: number): number[] => {
    const max = getPawnContractPrepaidStorageMax(termDays, paymentOptionDays);
    return Array.from({ length: max + 1 }, (_, index) => index);
};

/**
 * RUMUS UTAMA: Menghitung nominal Biaya Titip per satu periode.
 *
 * Alur Logika:
 * 1. Menghitung 'baseAmount' (Selisih antara Margin Keuntungan dan Potongan Biaya).
 *    Margin dan Potongan dihitung dari persentase terhadap nilai Dana Pencairan.
 * 2. Menghitung 'nextValue' berdasarkan skema hari:
 *    - Harian: baseAmount dibagi 14 (asumsi 2 minggu) lalu dibagi 7 hari.
 *    - Mingguan (7 hari): baseAmount dibagi 2 (setengah bulan).
 *    - 15 Hari: baseAmount utuh (satu periode 15 hari).
 * 3. Pembulatan: Hasil akhir dibulatkan ke ribuan terdekat (misal 140.400 jadi 140.000)
 *    untuk memudahkan kembalian tunai di cabang.
 */
export const calculatePawnContractStorageFee = (params: {
    disbursedValue: number;
    marginRate: number;
    deductionRate: number;
    paymentOptionDays: number;
}): number => {
    if (params.disbursedValue <= 0) {
        return 0;
    }

    // Pendapatan kotor dasar dari margin (misal 5% dari 1jt = 50rb)
    const grossAmount = params.disbursedValue * (params.marginRate / 100);
    // Potongan khusus (misal jika ada promo atau diskon biaya)
    const deductionAmount = params.disbursedValue * (params.deductionRate / 100);
    // Nilai bersih yang akan dibagi ke dalam periode-periode skema
    const baseAmount = grossAmount - deductionAmount;

    let nextValue = 0;

    // PENETAPAN NOMINAL PER SKEMA:
    if (params.paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily) {
        // Skema Harian: Menggunakan pembagi 14 untuk mendapatkan rate harian yang proporsional.
        nextValue = baseAmount / 2 / 7;
    } else if (params.paymentOptionDays === PawnContractPaymentOptionDaysEnum.Weekly) {
        // Skema Mingguan: Setengah dari biaya bulanan standar.
        nextValue = baseAmount / 2;
    } else {
        // Skema 15 Hari (Standard): Menggunakan nilai baseAmount secara utuh.
        nextValue = baseAmount;
    }

    /**
     * LOGIKA PEMBULATAN RIBUAN:
     * Jika nilai >= 1000, maka angka ratusannya dibulatkan (0-499 ke bawah, 500-999 ke atas).
     * Contoh: 140.501 -> 141.000, 140.499 -> 140.000.
     */
    const safeValue = Math.max(0, nextValue);
    if (safeValue >= 1000) {
        return Math.round(safeValue / 1000) * 1000;
    }

    return Math.round(safeValue);
};

/**
 * Menghitung total biaya titip prabayar (nominal per periode * jumlah periode yang diambil).
 */
export const calculatePawnContractPrepaidStorageAmount = (storageFeeAmount: number, periods: number): number =>
    Math.max(0, storageFeeAmount * periods);

/**
 * Membangun label rentang periode untuk UI (misal: "0 - 4" berarti bayar 4 periode di depan).
 */
export const buildPawnContractPrepaidStorageLabel = (periods: number): string =>
    periods >= 1 ? `0 - ${periods}` : '-';

/**
 * Kamus kata bantu untuk konversi angka ke teks terbilang.
 */
const indonesianWords = [
    '', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'
];

/**
 * FUNGSI REKURSIF TERBILANG:
 * Memecah angka besar menjadi satuan, puluhan, ratusan, dst. secara berulang (rekursif).
 *
 * Alur Kerja:
 * - < 12: Ambil langsung dari kamus 'indonesianWords'.
 * - 12-19: "satuan" + " belas".
 * - 20-99: "puluhan" + " puluh " + "satuan".
 * - 100-199: "seratus " + "sisa".
 * - 200-999: "ratusan" + " ratus " + "sisa".
 * - > 1000: Menggunakan pemecahan ribuan, jutaan, miliaran, triliunan, dst.
 */
const spellIndonesianNumber = (value: number): string => {
    if (value < 12) {
        return indonesianWords[value];
    }

    if (value < 20) {
        return `${spellIndonesianNumber(value - 10)} belas`;
    }

    if (value < 100) {
        return `${spellIndonesianNumber(Math.floor(value / 10))} puluh ${spellIndonesianNumber(value % 10)}`.trim();
    }

    if (value < 200) {
        return `seratus ${spellIndonesianNumber(value - 100)}`.trim();
    }

    if (value < 1000) {
        return `${spellIndonesianNumber(Math.floor(value / 100))} ratus ${spellIndonesianNumber(value % 100)}`.trim();
    }

    if (value < 2000) {
        return `seribu ${spellIndonesianNumber(value - 1000)}`.trim();
    }

    if (value < 1_000_000) {
        // Logika Ribuan
        return `${spellIndonesianNumber(Math.floor(value / 1000))} ribu ${spellIndonesianNumber(value % 1000)}`.trim();
    }

    if (value < 1_000_000_000) {
        // Logika Jutaan
        return `${spellIndonesianNumber(Math.floor(value / 1_000_000))} juta ${spellIndonesianNumber(value % 1_000_000)}`.trim();
    }

    if (value < 1_000_000_000_000) {
        // Logika Miliaran
        return `${spellIndonesianNumber(Math.floor(value / 1_000_000_000))} miliar ${spellIndonesianNumber(value % 1_000_000_000)}`.trim();
    }

    if (value < 1_000_000_000_000_000) {
        // Logika Triliunan
        return `${spellIndonesianNumber(Math.floor(value / 1_000_000_000_000))} triliun ${spellIndonesianNumber(value % 1_000_000_000_000)}`.trim();
    }

    return `${spellIndonesianNumber(Math.floor(value / 1_000_000_000_000_000))} kuadriliun ${spellIndonesianNumber(value % 1_000_000_000_000_000)}`.trim();
};

/**
 * Finalisasi teks terbilang: Menambahkan kata "Rupiah" di akhir dan Kapital di depan.
 */
export const convertNumberToIndonesianCurrencyWords = (value: number): string => {
    const normalizedValue = Math.max(0, Math.floor(value));
    if (normalizedValue === 0) {
        return 'Nol rupiah';
    }

    const words = spellIndonesianNumber(normalizedValue)
        .replace(/\s+/g, ' ')
        .trim();

    return `${words.charAt(0).toUpperCase()}${words.slice(1)} rupiah`;
};

/**
 * Menormalkan penulisan nama nasabah (lowercase, hapus spasi berlebih).
 */
export const normalizePawnContractCustomerName = (value: string): string =>
    value.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Memastikan input tanggal tetap dalam format YYYY-MM-DD.
 */
export const ensureDateInputValue = (value: string): string => normalizeDateInput(value);
