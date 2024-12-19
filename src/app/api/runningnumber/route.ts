import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { dbMssql } from "../../lib/db";
import { RunningNumberService } from "@/app/lib/runningnumber";
// import { RunningNumberServiceHelper } from "@/app/helpers/app";

// Fungsi POST untuk ekspor data
export async function POST(req: Request) {
  const data = await RunningNumberService('ABSENSI','ABSENSI', 'absensisupirheader','2024-10-07');

 
  return data;
}
