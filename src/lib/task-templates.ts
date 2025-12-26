'use client';

import { addDays, formatISO } from 'date-fns';

type TaskTemplate = {
  title: string;
  description: string;
  tasks: {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    tags: string[];
    dueDate: string;
    createdAt: string;
  }[];
};

const now = new Date();
const nowISO = formatISO(now);

export const taskTemplates: TaskTemplate[] = [
  {
    title: 'Peluncuran Blog Baru',
    description: 'Templat lengkap untuk meluncurkan blog atau situs web konten baru dari awal.',
    tasks: [
      {
        title: 'Penelitian & Perencanaan Konten',
        description: 'Identifikasi audiens target dan topik-topik pilar untuk 6 bulan pertama.',
        priority: 'High',
        tags: ['konten', 'strategi'],
        dueDate: formatISO(addDays(now, 7)),
        createdAt: nowISO,
      },
      {
        title: 'Desain & Pengembangan Situs Web',
        description: 'Gunakan kerangka kerja yang ringan, fokus pada pengalaman seluler dan kecepatan memuat.',
        priority: 'High',
        tags: ['desain', 'webdev'],
        dueDate: formatISO(addDays(now, 30)),
        createdAt: nowISO,
      },
      {
        title: 'Tulis 5 Posting Blog Pertama',
        description: 'Buat konten awal untuk mengisi situs sebelum peluncuran.',
        priority: 'Medium',
        tags: ['penulisan', 'konten'],
        dueDate: formatISO(addDays(now, 21)),
        createdAt: nowISO,
      },
      {
        title: 'Siapkan Analitik & SEO',
        description: 'Integrasikan Google Analytics, Search Console, dan plugin SEO dasar.',
        priority: 'Medium',
        tags: ['seo', 'analitik'],
        dueDate: formatISO(addDays(now, 28)),
        createdAt: nowISO,
      },
      {
        title: 'Promosikan Peluncuran di Media Sosial',
        description: 'Buat kampanye singkat untuk mengumumkan peluncuran blog.',
        priority: 'Low',
        tags: ['pemasaran', 'sosmed'],
        dueDate: formatISO(addDays(now, 35)),
        createdAt: nowISO,
      },
    ],
  },
  {
    title: 'Rencana Pindahan Rumah',
    description: 'Kelola semua tugas yang terkait dengan pindah ke tempat baru.',
    tasks: [
      {
        title: 'Cari & Sewa Perusahaan Pindahan',
        description: 'Dapatkan penawaran dari setidaknya 3 perusahaan pindahan terkemuka.',
        priority: 'High',
        tags: ['logistik', 'riset'],
        dueDate: formatISO(addDays(now, 14)),
        createdAt: nowISO,
      },
      {
        title: 'Declutter & Donasi Barang',
        description: 'Sortir barang-barang dan donasikan atau buang yang tidak lagi diperlukan.',
        priority: 'Medium',
        tags: ['organisasi'],
        dueDate: formatISO(addDays(now, 21)),
        createdAt: nowISO,
      },
      {
        title: 'Perbarui Alamat & Transfer Layanan',
        description: 'Perbarui alamat Anda untuk pos, bank, dan transfer layanan (listrik, internet).',
        priority: 'High',
        tags: ['administrasi', 'layanan'],
        dueDate: formatISO(addDays(now, 25)),
        createdAt: nowISO,
      },
      {
        title: 'Mulai Mengepak Barang Non-Esensial',
        description: 'Pak barang-barang seperti buku, dekorasi, dan pakaian di luar musim.',
        priority: 'Medium',
        tags: ['pengepakan'],
        dueDate: formatISO(addDays(now, 30)),
        createdAt: nowISO,
      },
      {
        title: 'Siapkan "Kotak Hari Pertama"',
        description: 'Pak kotak berisi barang-barang penting untuk 24 jam pertama di rumah baru Anda.',
        priority: 'High',
        tags: ['pengepakan', 'penting'],
        dueDate: formatISO(addDays(now, 34)),
        createdAt: nowISO,
      },
    ],
  },
  {
    title: 'Peluncuran Produk SaaS',
    description: 'Daftar periksa penting untuk peluncuran produk SaaS Anda.',
    tasks: [
      {
        title: 'Finalisasi Halaman Harga',
        description: 'Pastikan semua tingkatan harga dan fitur sudah jelas.',
        priority: 'High',
        tags: ['pemasaran', 'produk'],
        dueDate: formatISO(addDays(now, 10)),
        createdAt: nowISO,
      },
      {
        title: 'Siapkan Gerbang Pembayaran',
        description: 'Integrasikan Stripe atau gateway pembayaran lainnya dan uji alur pembayaran.',
        priority: 'High',
        tags: ['teknis', 'pembayaran'],
        dueDate: formatISO(addDays(now, 15)),
        createdAt: nowISO,
      },
      {
        title: 'Lakukan Pengujian Beta Tertutup',
        description: 'Undang sekelompok kecil pengguna untuk menguji produk dan mengumpulkan umpan balik.',
        priority: 'Medium',
        tags: ['qa', 'umpan balik'],
        dueDate: formatISO(addDays(now, 20)),
        createdAt: nowISO,
      },
      {
        title: 'Siapkan Papan Instrumen Analitik',
        description: 'Lacak pendaftaran, aktivasi, dan metrik retensi pengguna.',
        priority: 'Medium',
        tags: ['data', 'analitik'],
        dueDate: formatISO(addDays(now, 25)),
        createdAt: nowISO,
      },
      {
        title: 'Jadwalkan Peluncuran di Product Hunt',
        description: 'Siapkan aset dan rencanakan promosi untuk peluncuran Product Hunt.',
        priority: 'High',
        tags: ['pemasaran', 'peluncuran'],
        dueDate: formatISO(addDays(now, 40)),
        createdAt: nowISO,
      },
    ],
  },
];
