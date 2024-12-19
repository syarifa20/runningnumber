import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Hapus data dari tabel 'pesanandetail' dan 'pesananheader'
  await knex('pesanandetail').del();
  await knex('pesananheader').del();

  const totalPesananHeader = 100000; // Jumlah pesanan_header
  const detailData: any[] = []; // Array untuk menyimpan data pesanandetail

  for (let i = 1; i <= totalPesananHeader; i++) {
    // Menghasilkan tanggal acak untuk pesanan
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 10000000000)
    );
    const formattedDate = randomDate.toISOString().split('T')[0];

    // Tambahkan data pesananheader
    const pesananId = await knex('pesananheader')
      .insert({
        customer: `Customer ${i}`,
        keterangan: `Keterangan ${i}`,
        tglbukti: formattedDate,
      })
      .returning('id'); // Gunakan jika DB mendukung (PostgreSQL)

    const pesananHeaderId = pesananId[0]; // ID yang baru dimasukkan

    // Tambahkan 5 detail untuk setiap pesanan
    for (let j = 1; j <= 5; j++) {
      const qty = Math.floor(Math.random() * 10) + 1; // Jumlah acak antara 1-10
      const harga = Math.floor(Math.random() * 100) + 10; // Harga acak antara 10-110

      detailData.push({
        pesananheaderid: pesananHeaderId,
        product: `Product ${j}`,
        qty: qty,
        harga: harga,
        totalharga: qty * harga,
      });
    }
  }

  // Batch insert data pesanandetail
  await knex.batchInsert('pesanandetail', detailData, 1000);

}
