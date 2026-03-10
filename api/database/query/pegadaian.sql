-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.0.0.6468
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table pawnshop.administrasi
CREATE TABLE IF NOT EXISTS `administrasi` (
  `id_adm` int NOT NULL AUTO_INCREMENT,
  `no_id` varchar(100) DEFAULT NULL,
  `tanggal_transaksi` date NOT NULL,
  `jumlah` varchar(100) NOT NULL,
  `keterangan` text NOT NULL,
  PRIMARY KEY (`id_adm`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.admin_cabang
CREATE TABLE IF NOT EXISTS `admin_cabang` (
  `id_kas` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `total_kas` varchar(100) NOT NULL,
  PRIMARY KEY (`id_kas`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.akad
CREATE TABLE IF NOT EXISTS `akad` (
  `id_akad` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `no_id` varchar(100) NOT NULL,
  `key_nasabah` varchar(100) NOT NULL,
  `nama_barang` varchar(255) NOT NULL,
  `jenis_barang` enum('Elektronik','Kendaraan') NOT NULL,
  `kelengkapan` text NOT NULL,
  `kekurangan` text NOT NULL,
  `jangka_waktu_akad` enum('60','30','15','7','1') NOT NULL,
  `tanggal_akad` date NOT NULL,
  `tanggal_jatuh_tempo` date NOT NULL,
  `nilai_tafsir` varchar(100) NOT NULL,
  `nilai_pencairan` varchar(100) NOT NULL,
  `bt_7_hari` varchar(100) NOT NULL,
  `biaya_admin` varchar(100) NOT NULL,
  `terbilang` text NOT NULL,
  `status` enum('Lunas','Belum Lunas','Lelang','Perpanjang') NOT NULL,
  `maintenance` int NOT NULL DEFAULT '0',
  `status_akad` varchar(255) NOT NULL DEFAULT 'baru',
  `laporan_maintenance` varchar(255) DEFAULT NULL,
  `detail_jenis_barang` varchar(255) DEFAULT 'smartphone',
  `kelengkapan_barang_satu` varchar(255) DEFAULT NULL,
  `kelengkapan_barang_dua` varchar(255) DEFAULT NULL,
  `kelengkapan_barang_tiga` varchar(255) DEFAULT NULL,
  `status_lokasi` varchar(255) NOT NULL DEFAULT 'kantor',
  `target_lokasi` varchar(255) NOT NULL DEFAULT 'gudang',
  `opsi_pembayaran` int NOT NULL DEFAULT '7',
  PRIMARY KEY (`id_akad`)
) ENGINE=InnoDB AUTO_INCREMENT=5530 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.atk
CREATE TABLE IF NOT EXISTS `atk` (
  `id_atk` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `tanggal_atk` date NOT NULL,
  `jumlah_atk` varchar(100) NOT NULL,
  `keterangan` text NOT NULL,
  PRIMARY KEY (`id_atk`)
) ENGINE=InnoDB AUTO_INCREMENT=865 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.bea_titip
CREATE TABLE IF NOT EXISTS `bea_titip` (
  `id_bt` int NOT NULL AUTO_INCREMENT,
  `no_id` varchar(100) NOT NULL,
  `uniq_key` varchar(100) NOT NULL,
  `pembayaran` varchar(100) NOT NULL,
  `tanggal_pembayaran` date NOT NULL,
  `keterangan` text NOT NULL,
  PRIMARY KEY (`id_bt`)
) ENGINE=InnoDB AUTO_INCREMENT=9433 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.bku
CREATE TABLE IF NOT EXISTS `bku` (
  `id_bku` int NOT NULL AUTO_INCREMENT,
  `jenis` enum('umum','kas') NOT NULL,
  `tanggal` date NOT NULL,
  `uraian` text NOT NULL,
  `debit` varchar(100) NOT NULL,
  `kredit` varchar(100) NOT NULL,
  `saldo` varchar(100) NOT NULL,
  `id_cabang` varchar(100) NOT NULL,
  PRIMARY KEY (`id_bku`)
) ENGINE=InnoDB AUTO_INCREMENT=43652 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.cabang
CREATE TABLE IF NOT EXISTS `cabang` (
  `id_cabang` varchar(100) NOT NULL,
  `no_cabang` varchar(100) NOT NULL,
  `investor` varchar(100) NOT NULL,
  `nama_cabang` text NOT NULL,
  `telp_cabang` varchar(100) NOT NULL,
  `alamat_cabang` text NOT NULL,
  PRIMARY KEY (`id_cabang`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.hutang
CREATE TABLE IF NOT EXISTS `hutang` (
  `id_hutang` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `tanggal_hutang` date NOT NULL,
  `jumlah_hutang` varchar(100) NOT NULL,
  `keterangan_hutang` text NOT NULL,
  `status_hutang` enum('Lunas','Belum Lunas') NOT NULL,
  PRIMARY KEY (`id_hutang`)
) ENGINE=InnoDB AUTO_INCREMENT=527 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.hutang_cabang
CREATE TABLE IF NOT EXISTS `hutang_cabang` (
  `id_hutang_cabang` int NOT NULL AUTO_INCREMENT,
  `id_hutang` varchar(100) NOT NULL,
  `id_piutang` varchar(100) NOT NULL,
  `tanggal_transaksi` date NOT NULL,
  `jumlah` varchar(100) NOT NULL,
  `uraian_hutang` text NOT NULL,
  `uraian_piutang` text NOT NULL,
  `keterangan` text NOT NULL,
  `status` enum('Lunas','Belum Lunas') NOT NULL DEFAULT 'Belum Lunas',
  PRIMARY KEY (`id_hutang_cabang`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.hutang_kas
CREATE TABLE IF NOT EXISTS `hutang_kas` (
  `id_hutang_kas` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `jumlah` int NOT NULL,
  `uraian` text NOT NULL,
  `tanggal_hutang` date NOT NULL,
  `status_hutang` enum('Lunas','Belum Lunas') NOT NULL DEFAULT 'Belum Lunas',
  PRIMARY KEY (`id_hutang_kas`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.investor
CREATE TABLE IF NOT EXISTS `investor` (
  `id_investor` int NOT NULL AUTO_INCREMENT,
  `kode_investor` varchar(100) NOT NULL,
  `nama_investor` varchar(100) NOT NULL,
  `no_investor` varchar(100) NOT NULL,
  `alamat_investor` text NOT NULL,
  PRIMARY KEY (`id_investor`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.kas_cabang
CREATE TABLE IF NOT EXISTS `kas_cabang` (
  `id_kas` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `total_kas` varchar(100) NOT NULL,
  PRIMARY KEY (`id_kas`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.login
CREATE TABLE IF NOT EXISTS `login` (
  `id_login` int NOT NULL AUTO_INCREMENT,
  `username_login` varchar(100) NOT NULL,
  `sesi_login` varchar(100) NOT NULL,
  `waktu_login` datetime NOT NULL,
  `waktu_logout` datetime NOT NULL,
  `ip_addr` varchar(100) NOT NULL,
  `status` enum('IN','OUT') NOT NULL,
  PRIMARY KEY (`id_login`)
) ENGINE=InnoDB AUTO_INCREMENT=10440 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_akad
CREATE TABLE IF NOT EXISTS `log_akad` (
  `id_log_akad` int NOT NULL AUTO_INCREMENT,
  `no_id` varchar(100) NOT NULL,
  `tanggal_log` date NOT NULL,
  `status` enum('Belum Lunas','Lunas','Lelang','Perpanjang') NOT NULL DEFAULT 'Belum Lunas',
  PRIMARY KEY (`id_log_akad`)
) ENGINE=InnoDB AUTO_INCREMENT=5530 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_bea_titip
CREATE TABLE IF NOT EXISTS `log_bea_titip` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `no_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pembayaran` double NOT NULL DEFAULT '0',
  `tanggal_pembayaran` datetime DEFAULT NULL,
  `keterangan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_edit_akad
CREATE TABLE IF NOT EXISTS `log_edit_akad` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `no_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_bea_titip` double NOT NULL DEFAULT '0',
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_log` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_hutang
CREATE TABLE IF NOT EXISTS `log_hutang` (
  `id_log_hutang` int NOT NULL AUTO_INCREMENT,
  `tanggal_log_hutang` date NOT NULL,
  `jumlah_log_hutang` varchar(100) NOT NULL,
  `keterangan_log_hutang` text NOT NULL,
  `hutang` varchar(100) NOT NULL,
  `pelunasan` varchar(100) NOT NULL,
  PRIMARY KEY (`id_log_hutang`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_hutang_kas
CREATE TABLE IF NOT EXISTS `log_hutang_kas` (
  `id_log_hutang_kas` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `jumlah` varchar(100) NOT NULL,
  `uraian` text NOT NULL,
  `tanggal_transaksi` date NOT NULL,
  PRIMARY KEY (`id_log_hutang_kas`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_kas_cabang
CREATE TABLE IF NOT EXISTS `log_kas_cabang` (
  `id_log_kas` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `jenis` enum('debit','kredit') NOT NULL,
  `keterangan` text NOT NULL,
  `jumlah` varchar(100) NOT NULL,
  `tanggal_log_kas` date NOT NULL,
  PRIMARY KEY (`id_log_kas`)
) ENGINE=InnoDB AUTO_INCREMENT=6974 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_lelang
CREATE TABLE IF NOT EXISTS `log_lelang` (
  `id_log_lelang` int NOT NULL AUTO_INCREMENT,
  `no_id` varchar(100) NOT NULL,
  `tunggakan` varchar(100) NOT NULL,
  `nilai_lelang` varchar(100) NOT NULL,
  `admin_lelang` varchar(100) NOT NULL,
  `pengembalian` varchar(100) NOT NULL,
  `tanggal` date NOT NULL,
  `status` enum('Lelang','Refund') NOT NULL DEFAULT 'Lelang',
  PRIMARY KEY (`id_log_lelang`)
) ENGINE=InnoDB AUTO_INCREMENT=558 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_modal_investor
CREATE TABLE IF NOT EXISTS `log_modal_investor` (
  `id_log_modal_investor` int NOT NULL AUTO_INCREMENT,
  `tanggal_transaksi` date NOT NULL,
  `jumlah_transaksi` varchar(100) NOT NULL,
  `keterangan` text NOT NULL,
  PRIMARY KEY (`id_log_modal_investor`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.log_saldo_cabang
CREATE TABLE IF NOT EXISTS `log_saldo_cabang` (
  `id_log_kas` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `jenis` enum('debit','kredit') NOT NULL,
  `keterangan` text NOT NULL,
  `jumlah` varchar(100) NOT NULL,
  `tanggal_log_saldo` date NOT NULL,
  PRIMARY KEY (`id_log_kas`)
) ENGINE=InnoDB AUTO_INCREMENT=36359 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.modal_investor
CREATE TABLE IF NOT EXISTS `modal_investor` (
  `id_modal` int NOT NULL AUTO_INCREMENT,
  `id_investor` int NOT NULL,
  `id_cabang` int NOT NULL,
  `tanggal` date NOT NULL,
  `keterangan` text NOT NULL,
  `jumlah_modal` varchar(100) NOT NULL,
  PRIMARY KEY (`id_modal`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.nasabah
CREATE TABLE IF NOT EXISTS `nasabah` (
  `id_nasabah` int NOT NULL AUTO_INCREMENT,
  `key_nasabah` varchar(100) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `jenis_kelamin` enum('Pria','Wanita') NOT NULL,
  `kota` varchar(100) NOT NULL,
  `no_telp` varchar(100) NOT NULL,
  `jenis_id` enum('KTP','SIM','KK') NOT NULL,
  `no_identitas` varchar(100) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `tanggal_daftar` date NOT NULL,
  `alamat` text NOT NULL,
  `status_nasabah` varchar(255) NOT NULL DEFAULT 'bersangkutan',
  PRIMARY KEY (`id_nasabah`)
) ENGINE=InnoDB AUTO_INCREMENT=2189 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.notif
CREATE TABLE IF NOT EXISTS `notif` (
  `id_notif` int NOT NULL AUTO_INCREMENT,
  `uniq_key` varchar(100) NOT NULL,
  `no_id` varchar(100) NOT NULL,
  `pesan` text NOT NULL,
  `status` enum('Belum Dibaca','Sudah Dibaca') NOT NULL DEFAULT 'Belum Dibaca',
  `tanggal_notif` date NOT NULL,
  PRIMARY KEY (`id_notif`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.penambahan_modal
CREATE TABLE IF NOT EXISTS `penambahan_modal` (
  `id_penambahan_modal` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `tanggal` date NOT NULL,
  `jumlah` varchar(100) NOT NULL,
  `keterangan` text NOT NULL,
  PRIMARY KEY (`id_penambahan_modal`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.peralihan_modal
CREATE TABLE IF NOT EXISTS `peralihan_modal` (
  `id_peralihan` int NOT NULL AUTO_INCREMENT,
  `id_cabang_sumber` varchar(100) NOT NULL,
  `id_cabang_tujuan` varchar(100) NOT NULL,
  `tanggal_peralihan` date NOT NULL,
  `jumlah_peralihan` varchar(100) NOT NULL,
  PRIMARY KEY (`id_peralihan`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.perpanjangan_akad
CREATE TABLE IF NOT EXISTS `perpanjangan_akad` (
  `id_perpanjangan` int NOT NULL AUTO_INCREMENT,
  `no_id` varchar(100) NOT NULL,
  `jangka_waktu_perpanjangan` varchar(10) NOT NULL,
  `tanggal_perpanjangan` date NOT NULL,
  `tanggal_jatuh_tempo_perpanjangan` date NOT NULL,
  PRIMARY KEY (`id_perpanjangan`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.refund
CREATE TABLE IF NOT EXISTS `refund` (
  `id_refund` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `tanggal` date NOT NULL,
  `jumlah` varchar(100) NOT NULL,
  `uraian` text NOT NULL,
  PRIMARY KEY (`id_refund`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.saldo_cabang
CREATE TABLE IF NOT EXISTS `saldo_cabang` (
  `id_saldo_cabang` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `total_saldo` varchar(100) NOT NULL,
  PRIMARY KEY (`id_saldo_cabang`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.setting
CREATE TABLE IF NOT EXISTS `setting` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jenis_barang` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `margin` int NOT NULL DEFAULT '0',
  `potongan` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.user
CREATE TABLE IF NOT EXISTS `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `level` enum('admin','moderator','investor') NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table pawnshop.user_cabang
CREATE TABLE IF NOT EXISTS `user_cabang` (
  `id_user_cabang` int NOT NULL AUTO_INCREMENT,
  `id_cabang` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  PRIMARY KEY (`id_user_cabang`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
