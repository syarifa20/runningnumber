import { db, dbMssql } from "./db";
import { NextResponse } from "next/server";
import {
  GenerateRunningNumberService,
  RunningNumberServiceHelper,
} from "../helpers/app";
import { count, log } from "node:console";

export async function RunningNumberService(
  group: string,
  subgrp: string,
  table: string,
  tanggal: string
) {
  let tgl: string = tanggal; // contoh format tanggal
  let dateObj: Date = new Date(tgl);
  let nobukti;
  let lastCount;
  let countRow;
  let a;
  let b;
  let c;

  const parameter = await dbMssql
    .select([
      "parameter.id",
      "parameter.text",
      dbMssql.raw("isnull(type.text,'') as type"),
    ])
    .from("parameter")
    .leftJoin("parameter as type", "parameter.type", "=", "type.id")
    .where("parameter.grp", "=", group)
    .where("parameter.subgrp", "=", subgrp)
    .first();

  if (!parameter.text) {
    return { message: "Parameter not found", status: 404 };
  }

  let bulan: number = dateObj.getMonth() + 1;
  let tahun: number = dateObj.getFullYear();

  const statusformat = parameter.id;
  const text = parameter.text;
  const type = parameter.type;

  if (type == "RESET BULAN") {
    const lastRowResult = await dbMssql
      .from("absensisupirheader")
      .whereRaw("MONTH(tglbukti) = ?", [bulan])
      .whereRaw("YEAR(tglbukti) = ?", [tahun])
      .forUpdate()
      .count();

    lastCount = lastRowResult[0];
    countRow = lastCount[""];

    a = 0;
    b = countRow;
    c = 0;

    while (a <= Number(countRow)) {

    nobukti = await RunningNumberServiceHelper(text, a, bulan, tgl);

    const queryCheck = await dbMssql
      .from("absensisupirheader")
      .where("nobukti", "=", nobukti)
      .whereRaw("MONTH(tglbukti) = ?", [bulan])
      .whereRaw("YEAR(tglbukti) = ?", [tahun])
      .whereRaw("statusformat = ?", [statusformat])
      .first();

    if (!queryCheck) {
      if (a > 1) {
        c = a - 1;

        const nobukticek = await RunningNumberServiceHelper(
          text,
          c,
          bulan,
          tgl
        );

        const queryCheckPrev = await dbMssql
          .from("absensisupirheader")
          .where("nobukti", "=", nobukticek)
          .whereRaw("MONTH(tglbukti) = ?", [bulan])
          .whereRaw("YEAR(tglbukti) = ?", [tahun])
          .whereRaw("tglbukti <= ?", [tgl])
          .where("statusformat", "=", statusformat)
          .orderBy("tglbukti", "desc")
          .orderBy("nobukti", "desc")
          .first();

        if (queryCheckPrev) {
          countRow = a;

          console.log(countRow);

          a = Number(b);
        } else {
          a = Number(b);
        }
      }
    }

    a++;
    }
  }

  if (type == "RESET TAHUN") {
    const lastRowResult = await dbMssql
      .from("absensisupirheader")
      .whereRaw("MONTH(tglbukti) = ?", [bulan])
      .whereRaw("YEAR(tglbukti) = ?", [tahun])
      .forUpdate()
      .count();

    let lastCount = lastRowResult[0];
    let countRow = lastCount[""];

    a = 0;
    b = countRow;
    c = 0;

    while (a <= Number(countRow)) {
      nobukti = await RunningNumberServiceHelper(text, a, bulan, tgl);

      const queryCheck = await dbMssql
        .from("absensisupirheader")
        .where("nobukti", "=", nobukti)
        .whereRaw("YEAR(tglbukti) = ?", [tahun])
        .whereRaw("statusformat = ?", [statusformat])
        .first();

      if (!queryCheck) {
        // Jika nobukti belum ada di database
        if (a > 1) {
          c = a - 1; // Mengurangi a untuk cek sebelumnya

          // Generate nobukticek menggunakan RunningNumberServiceHelper untuk sebelumnya
          const nobukticek = await RunningNumberServiceHelper(
            text,
            c,
            bulan,
            tgl
          );

          const queryCheckPrev = await dbMssql
            .from("absensisupirheader")
            .where("nobukti", "=", nobukticek)
            .whereRaw("YEAR(tglbukti) = ?", [tahun])
            .whereRaw("tglbukti <= ?", [tgl]) // Mengecek apakah tglbukti kurang dari atau sama dengan tgl
            .where("statusformat", "=", statusformat)
            .orderBy("tglbukti", "desc")
            .orderBy("nobukti", "desc")
            .first(); // Ambil baris pertama

          if (queryCheckPrev) {
            // Jika data sebelumnya ditemukan
            countRow = a; // Update countRow ke nilai a
            a = Number(b); // Set nilai a ke b (mengakhiri loop)
          } else {
            a = Number(b); // Jika tidak ada data sebelumnya, langsung keluar dari loop
          }
        }
      }

      a++;
    }
  }

  let lastTypeRow;

  if (type == "") {
    lastTypeRow = await dbMssql
      .from("absensisupirheader")
      .where("statusformat", "=", statusformat)
      .forUpdate()
      .count();

    lastCount = lastTypeRow[0];
    countRow = lastCount[""];

    // let a = 0;
    // let b = countRow;
    // let c = 0;
  }

  const runningnumber = await GenerateRunningNumberService(
    text,
    countRow,
    bulan,
    tgl,
    table
  );
  console.log(runningnumber);

  return runningnumber;
}
