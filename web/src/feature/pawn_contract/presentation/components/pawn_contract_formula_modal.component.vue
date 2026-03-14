<script setup lang="ts">
import BaseModalComponent from '@core/presentation/components/base_modal.component.vue';

interface PawnContractFormulaModalProps {
  isOpen: boolean;
}

defineProps<PawnContractFormulaModalProps>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <BaseModalComponent
    :is-open="isOpen"
    title="Panduan Lengkap Rumus & Simulasi Biaya"
    size="xl"
    @close="emit('close')"
  >
    <div class="p-4">
      <div class="row g-4">
        <!-- Kolom Kiri: Rumus & Klasifikasi -->
        <div class="col-12 col-lg-7">
          <section class="mb-4">
            <h6 class="fw-bold text-primary mb-3">
              <i class="bi bi-calculator me-2"></i>1. Rumus Utama Biaya Titip (Sewa Modal)
            </h6>
            <div class="card bg-light border-0 mb-3">
              <div class="card-body">
                <div class="bg-white p-3 rounded border text-center font-monospace mb-2 shadow-sm">
                  Biaya = Pinjaman × (Rate Margin - Rate Potongan) × Skema_Tenor
                </div>
                <p class="small text-muted mb-0">
                  * Biaya dihitung dari <strong>Dana Pencairan</strong>. Pembulatan dilakukan ke <strong>ribuan terdekat</strong> (e.g., 140.501 &rarr; 141.000).
                </p>
              </div>
            </div>

            <h6 class="fw-bold text-dark small mb-2 text-uppercase">Tabel Rate & Biaya Admin Per Jenis Barang</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered bg-white small">
                <thead class="table-light text-center">
                  <tr>
                    <th>Kategori</th>
                    <th>Contoh Barang</th>
                    <th>Margin (%)</th>
                    <th>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Elektronik</strong></td>
                    <td>Smartphone, Laptop, TV, Kamera</td>
                    <td class="text-center">8% - 12%</td>
                    <td class="text-center">Rp 10.000</td>
                  </tr>
                  <tr>
                    <td><strong>Kendaraan</strong></td>
                    <td>Motor, Mobil</td>
                    <td class="text-center">13% - 14%</td>
                    <td class="text-center">Rp 50.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="mb-0">
            <h6 class="fw-bold text-primary mb-3">
              <i class="bi bi-diagram-3 me-2"></i>2. Penjabaran Skema Pembayaran
            </h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered bg-white small mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Skema</th>
                    <th>Dasar Perhitungan</th>
                    <th>Beban Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>15 Hari</strong></td>
                    <td>Hasil rumus (Base) utuh per periode.</td>
                    <td><span class="badge bg-success">100% Rate</span></td>
                  </tr>
                  <tr>
                    <td><strong>7 Hari</strong></td>
                    <td>Setengah dari skema 15 hari.</td>
                    <td><span class="badge bg-warning text-dark">50% Rate</span></td>
                  </tr>
                  <tr>
                    <td><strong>Harian</strong></td>
                    <td>Biaya 15 hari dibagi 14 hari.</td>
                    <td><span class="badge bg-danger">~7% Rate</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="small text-muted mt-2 mb-0">
              *Skema <strong>7 Hari</strong> dan <strong>15 Hari</strong> dihitung per-periode tetap, sedangkan <strong>Harian</strong> dihitung per-tanggal.
              <br>
              <span class="text-danger fw-bold">* Khusus Kategori Kendaraan: Skema Harian tidak tersedia (hanya 7 & 15 hari).</span>
            </p>
          </section>
        </div>

        <!-- Kolom Kanan: Skenario Terperinci -->
        <div class="col-12 col-lg-5">
          <section class="h-100">
            <h6 class="fw-bold text-success mb-3">
              <i class="bi bi-list-check me-2"></i>Skenario "Berapa yang Diterima?"
            </h6>
            
            <!-- Tabel Skenario Durasi -->
            <div class="card border-success shadow-sm overflow-hidden mb-4">
              <div class="card-header bg-success text-white py-2 small fw-bold text-center">
                SIMULASI PINJAMAN RP 1.000.000 (ELEKTRONIK)
              </div>
              <div class="table-responsive">
                <table class="table table-sm table-hover mb-0 text-center small">
                  <thead class="table-light">
                    <tr>
                      <th class="py-2">Durasi</th>
                      <th class="py-2">Skema</th>
                      <th class="py-2">Uang Bersih Diterima</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="py-2"><strong>1 Hari</strong></td>
                      <td>Harian</td>
                      <td class="bg-success bg-opacity-10 fw-bold">Rp 983.000</td>
                    </tr>
                    <tr>
                      <td class="py-2"><strong>3 Hari</strong></td>
                      <td>Harian</td>
                      <td class="bg-success bg-opacity-10 fw-bold">Rp 969.000</td>
                    </tr>
                    <tr>
                      <td class="py-2"><strong>7 Hari</strong></td>
                      <td>7 Hari</td>
                      <td class="bg-success bg-opacity-10 fw-bold">Rp 940.000</td>
                    </tr>
                    <tr>
                      <td class="py-2"><strong>15 Hari</strong></td>
                      <td>15 Hari</td>
                      <td class="bg-success bg-opacity-10 fw-bold">Rp 890.000</td>
                    </tr>
                    <tr>
                      <td class="py-2"><strong>30 Hari</strong></td>
                      <td>15 Hari x 2</td>
                      <td class="bg-success bg-opacity-10 fw-bold">Rp 790.000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="card-footer bg-light p-2 small text-muted">
                <i class="bi bi-info-circle me-1"></i> Sudah dipotong <strong>Admin 10rb</strong> & <strong>Biaya Titip</strong> di muka.
              </div>
            </div>

            <!-- Contoh Kendaraan -->
            <div class="card border-info shadow-sm overflow-hidden">
              <div class="card-header bg-info text-white py-2 small fw-bold">CONTOH KENDARAAN (MOTOR)</div>
              <div class="card-body p-3">
                <div class="d-flex justify-content-between small mb-1">
                  <span>Pinjaman:</span>
                  <span class="fw-bold">Rp 5.000.000</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span>Biaya Admin:</span>
                  <span class="text-danger">- Rp 50.000</span>
                </div>
                <div class="d-flex justify-content-between small mb-1 border-bottom pb-1">
                  <span>Titip 15 Hari:</span>
                  <span class="text-danger">- Rp 500.000</span>
                </div>
                <div class="d-flex justify-content-between fw-bold text-info mt-2">
                  <span>Uang Bersih:</span>
                  <span class="h5 mb-0">Rp 4.450.000</span>
                </div>
                <div class="mt-2 small text-muted italic">
                  * Menggunakan skema 15 Hari (Harian tidak diperbolehkan).
                </div>
              </div>
            </div>

            <div class="alert alert-secondary mt-3 p-2 small mb-0">
              <i class="bi bi-info-circle me-1"></i> <strong>Tips Hemat:</strong> Untuk tebus kilat (< 7 hari), gunakan skema <strong>Harian</strong> agar biaya titip lebih ringan bagi nasabah.
            </div>
          </section>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="emit('close')">Tutup Panduan</button>
    </template>
  </BaseModalComponent>
</template>

<style scoped>
.font-monospace {
  font-size: 1.1rem;
  color: #1e40af;
}
</style>
