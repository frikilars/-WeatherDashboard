🌦️ Weather Dash

📘 Deskripsi Proyek
Weather Dash adalah aplikasi web interaktif yang menampilkan informasi cuaca secara real-time dengan memanfaatkan AJAX dan layanan Web Service API. Aplikasi ini menggunakan OpenWeatherMap API sebagai sumber utama data meteorologi dan mendukung pencarian kota secara dinamis. Sistem juga dilengkapi validasi otomatis, sehingga apabila nama kota tidak ditemukan, aplikasi akan menampilkan pesan “City not found” untuk memberi tahu pengguna.

✨ Fitur Utama aplikasi meliputi:

- Menampilkan cuaca saat ini secara real-time

- Informasi lengkap seperti suhu, kelembapan, kecepatan angin, kondisi langit, dan deskripsi cuaca

- Fitur pencarian kota dengan validasi jika kota tidak tersedia

- Pembaruan tampilan cuaca secara otomatis tanpa reload halaman

- Antarmuka responsif dan modern menggunakan kombinasi CSS3 dan JavaScript DOM Manipulation

- Penanganan error untuk nama kota yang tidak valid atau API tidak tersedia
  

🏗️ Arsitektur Teknologi

Pengembangan sistem Weather Dashboard menggunakan teknologi standar web modern sebagai berikut:

- HTML5 – Digunakan sebagai struktur dasar halaman dengan elemen semantik.

- CSS3 – Mengatur tata letak antarmuka menggunakan Flexbox dan CSS Grid, serta memanfaatkan variabel CSS untuk konsistensi tema.

- JavaScript – Menangani seluruh logika sisi klien, termasuk event, validasi, dan pemrosesan data.

- Fetch API (async/await) – Melakukan komunikasi data secara asinkron melalui permintaan HTTP tanpa memblokir proses lain.

- Manipulasi DOM Dinamis – Memperbarui elemen UI secara real-time tanpa perlu memuat ulang halaman.

- OpenWeatherMap API – Penyedia data cuaca utama, melalui endpoint:

      /forecast → data prakiraan cuaca

      /weather → data cuaca saat ini

🔁 Alur Kerja

1. Pengguna memasukkan nama kota melalui kolom pencarian.

2. AJAX mengirim permintaan ke Open-Meteo Geocoding API untuk mendapatkan data lokasi.

3. API mengembalikan koordinat berupa latitude dan longitude.

4. AJAX mengirim permintaan kedua ke Tomorrow.io Weather API menggunakan koordinat tersebut.

5. Data JSON yang diterima diproses dan ditampilkan ke antarmuka pengguna (UI) secara dinamis tanpa memuat ulang halaman.


Tugas Akhir Praktikum Pemrograman Web – Judul 6 (AJAX dan Web Service)

Nama: Friskila R Simarmata

NIM: 2315061043
