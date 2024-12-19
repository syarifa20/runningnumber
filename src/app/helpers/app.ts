import { log } from "node:console";
import { db, dbMssql } from "../lib/db";

type FormatOptions = {
  lastRow: number;
  bulan: number;
  tglbukti: string;
  tujuan?: number;
  cabang?: number;
  jenisbiaya?: number;
  marketing?: number;
  statusformat?: number;
  tableName?: string;
  table?: string;
};

class RunningNumberHelper {
  private static staticSeparator = "#";
  private static staticSeparatorFormat = "|";
  private static dynamicSeparator = "*";

  // Method utama untuk mengolah format dan menghasilkan nomor
  static getFormat(format: string, options: FormatOptions): string {
    const {
      lastRow,
      bulan,
      tglbukti,
      tujuan,
      cabang,
      jenisbiaya,
      marketing,
      statusformat,
    } = options;

    let staticTexts: string[] = [];
    let dynamicTexts: string[] = [];
    let separatedResults: string[] = [];
    let tempStaticText = "";
    let tempDynamicText = "";

    format = format.replace(RunningNumberHelper.staticSeparatorFormat, "");

    this.separateText(format, staticTexts, dynamicTexts, separatedResults);

    let formatAngka = "";
    this.formatDynamicTexts(
      dynamicTexts,
      bulan,
      tglbukti,
      tujuan,
      cabang,
      jenisbiaya,
      marketing,
      lastRow,
      statusformat
    );

    this.mergeTexts(separatedResults, staticTexts, dynamicTexts);

    let result;

    if (statusformat !== 0) {
      const nobukti = separatedResults.join(""); // Gabungkan hasil menjadi string
      const format = formatAngka || ""; // Pastikan formatangka memiliki nilai, fallback ke string kosong
      result = [
        {
          nobukti: nobukti,
          formatangka: format,
        },
      ];
    } else {
      result = separatedResults.join("");
    }

    return result;
  }

  private static separateText(
    format: string,
    staticTexts: string[],
    dynamicTexts: string[],
    separatedResults: string[]
  ) {
    let totalSeparator = 0;
    let tempStaticText = "";
    let tempDynamicText = "";
    let tempResult = "";

    for (let i = 0; i < format.length; i++) {
      const char = format[i];

      if (char == RunningNumberHelper.staticSeparator) {
        totalSeparator++;
      }

      if (totalSeparator == 1) {
        if (char !== RunningNumberHelper.staticSeparator) {
          tempStaticText += char;
        } else {
          separatedResults.push(RunningNumberHelper.dynamicSeparator);
          tempResult += RunningNumberHelper.dynamicSeparator;
        }
      } else if (totalSeparator === 0) {
        if (char != RunningNumberHelper.staticSeparator) {
          tempDynamicText += char;
        }
        if (i === format.length - 1) {
          dynamicTexts.push(tempDynamicText);
          tempDynamicText = "";
          separatedResults.push(RunningNumberHelper.dynamicSeparator);
        }
      } else {
        dynamicTexts.push(tempDynamicText);
        tempDynamicText = "";
        separatedResults.push(char);
        tempResult += char;
      }

      if (totalSeparator === 2) {
        staticTexts.push(tempStaticText);
        tempStaticText = "";
        totalSeparator = 0;
      }
    }
  }

  private static formatDynamicTexts(
    dynamicTexts: string[],
    bulan: number,
    tglbukti: string,
    tujuan?: number,
    cabang?: number,
    jenisbiaya?: number,
    marketing?: number,
    lastRow?: number,
    statusformat?: number
  ) {
    dynamicTexts.forEach((text, index) => {
      const dynamicText = text.trim();

      if (dynamicText === "R") {
        dynamicTexts[index] = this.numberToRoman(bulan);
      } else if (dynamicText === "T") {
        dynamicTexts[index] = this.tujuan(tujuan || 0);
      } else if (dynamicText === "M") {
        dynamicTexts[index] = this.marketing(marketing || 0);
      } else if (dynamicText === "C") {
        dynamicTexts[index] = this.cabang(cabang || 0);
      } else if (dynamicText === "J") {
        dynamicTexts[index] = this.jenisbiaya(jenisbiaya || 0);
      } else if (this.isDateFormat(dynamicText)) {
        dynamicTexts[index] = this.formatDate(tglbukti, dynamicText);
      } else if (/^\d+$/.test(dynamicText)) {
        // Jika teks berupa angka
        dynamicTexts[index] = this.formatNumber(
          lastRow || 0,
          dynamicText,
          statusformat || 0
        );
      }
    });
  }

  // Gabungkan kembali teks statis dan dinamis
  private static mergeTexts(
    separatedResults: string[],
    staticTexts: string[],
    dynamicTexts: string[]
  ) {
    let staticIterator = 0;
    let dynamicIterator = 0;

    separatedResults.forEach((separatedResult, index) => {
      if (separatedResult === RunningNumberHelper.staticSeparator) {
        separatedResults[index] = staticTexts[staticIterator++];
      } else if (separatedResult === RunningNumberHelper.dynamicSeparator) {
        separatedResults[index] = dynamicTexts[dynamicIterator++];
      }
    });
  }

  // Mengonversi angka menjadi angka Romawi
  private static numberToRoman(number: number): string {
    const map: { [key: string]: number } = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    };

    // Mengurutkan kunci berdasarkan nilai (dari yang terbesar)
    const keys = Object.keys(map).sort((a, b) => map[b] - map[a]);

    let result = "";
    for (let key of keys) {
      while (number >= map[key]) {
        result += key;
        number -= map[key];
      }
    }
    return result;
  }

  // Mengecek apakah format adalah tanggal
  private static isDateFormat(format: string): boolean {
    const dateFormats = ["Y", "M", "D", "N"];
    return dateFormats.some((df) => format.includes(df));
  }

  // Mengformat tanggal
  private static formatDate(tglbukti: string, format: string): string {
    const date = new Date(tglbukti);
    const options: Intl.DateTimeFormatOptions = {};

    if (format.includes("Y")) options.year = "numeric";
    if (format.includes("M")) options.month = "2-digit";
    if (format.includes("D")) options.day = "2-digit";

    return date.toLocaleDateString("en-GB", options);
  }

  private static formatNumber(
    lastRow: number,
    dynamicText: string,
    statusformat?: number
  ): string {
    if (statusformat !== 0) {
      return dynamicText; // Format tertentu jika statusformat tidak 0
    }
    return String(lastRow + 1).padStart(dynamicText.length, "0"); // Format dengan padding
  }

  // Ambil tujuan dari ID
  private static tujuan(tujuan: number): string {
    return `T${tujuan}`;
  }

  // Ambil marketing dari ID
  private static marketing(marketing: number): string {
    return `M${marketing}`;
  }

  // Ambil cabang dari ID
  private static cabang(cabang: number): string {
    return `C${cabang}`;
  }

  // Ambil jenis biaya dari ID
  private static jenisbiaya(jenisbiaya: number): string {
    return `J${jenisbiaya}`;
  }
}

class RunningNumber {
  private static staticSeparator = "#";
  private static staticSeparatorFormat = "|";
  private static dynamicSeparator = "*";

  static async getFormat(
    format: string,
    options: FormatOptions
  ): Promise<string> {
    const {
      lastRow,
      bulan,
      tglbukti,
      tujuan,
      cabang,
      jenisbiaya,
      marketing,
      statusformat,
      tableName
    } = options;

    let staticTexts: string[] = [];
    let dynamicTexts: string[] = [];
    let separatedResults: string[] = [];
    let tempStaticText = "";
    let tempDynamicText = "";

    format = format.replace(RunningNumber.staticSeparatorFormat, "");

    this.separateText(format, staticTexts, dynamicTexts, separatedResults);

    this.formatDynamicTexts(
      dynamicTexts,
      bulan,
      tglbukti,
      tujuan,
      cabang,
      jenisbiaya,
      marketing,
      lastRow,
      statusformat
    );

    this.mergeTexts(separatedResults, staticTexts, dynamicTexts);

    let result = separatedResults.join("");

    // Cek apakah nomor bukti sudah ada di database
    const sqlcek = await dbMssql('absensisupirheader')
      .from(dbMssql.raw(`absensisupirheader a with (readuncommitted)`))
      .select("a.nobukti")
      .where("a.nobukti", "=", result)
      .first();

    if (sqlcek) {
      const lasRowNext = lastRow + 1;
      const newOptions: FormatOptions = {
        ...options,
        lastRow: lasRowNext,
      };

      result = await this.getFormat(format, newOptions);
    }

    return result;
  }

  private static separateText(
    format: string,
    staticTexts: string[],
    dynamicTexts: string[],
    separatedResults: string[]
  ) {
    let totalSeparator = 0;
    let tempStaticText = "";
    let tempDynamicText = "";

    for (let i = 0; i < format.length; i++) {
      const char = format[i];

      if (char === RunningNumber.staticSeparator) {
        totalSeparator++;
      }

      if (totalSeparator === 1) {
        if (char !== RunningNumber.staticSeparator) {
          tempStaticText += char;
        } else {
          separatedResults.push(RunningNumber.dynamicSeparator);
        }
      } else if (totalSeparator === 0) {
        if (char !== RunningNumber.staticSeparator) {
          tempDynamicText += char;
        }
        if (i === format.length - 1) {
          dynamicTexts.push(tempDynamicText);
          separatedResults.push(RunningNumber.dynamicSeparator);
        }
      } else {
        dynamicTexts.push(tempDynamicText);
        tempDynamicText = "";
        separatedResults.push(char);
      }

      if (totalSeparator === 2) {
        staticTexts.push(tempStaticText);
        tempStaticText = "";
        totalSeparator = 0;
      }
    }
  }

  private static formatDynamicTexts(
    dynamicTexts: string[],
    bulan: number,
    tglbukti: string,
    tujuan?: number,
    cabang?: number,
    jenisbiaya?: number,
    marketing?: number,
    lastRow?: number,
    statusformat?: number
  ) {
    dynamicTexts.forEach((text, index) => {
      const dynamicText = text.trim();

      if (dynamicText === "R") {
        dynamicTexts[index] = this.numberToRoman(bulan);
      } else if (dynamicText === "T") {
        dynamicTexts[index] = this.tujuan(tujuan || 0);
      } else if (dynamicText === "M") {
        dynamicTexts[index] = this.marketing(marketing || 0);
      } else if (dynamicText === "C") {
        dynamicTexts[index] = this.cabang(cabang || 0);
      } else if (dynamicText === "J") {
        dynamicTexts[index] = this.jenisbiaya(jenisbiaya || 0);
      } else if (this.isDateFormat(dynamicText)) {
        dynamicTexts[index] = this.formatDate(tglbukti, dynamicText);
      } else if (/^\d+$/.test(dynamicText)) {
        dynamicTexts[index] = this.formatNumber(lastRow || 0, dynamicText);
      }
    });
  }

  private static mergeTexts(
    separatedResults: string[],
    staticTexts: string[],
    dynamicTexts: string[]
  ) {
    let staticIterator = 0;
    let dynamicIterator = 0;

    separatedResults.forEach((separatedResult, index) => {
      if (separatedResult === RunningNumber.staticSeparator) {
        separatedResults[index] = staticTexts[staticIterator++];
      } else if (separatedResult === RunningNumber.dynamicSeparator) {
        separatedResults[index] = dynamicTexts[dynamicIterator++];
      }
    });
  }

  private static numberToRoman(number: number): string {
    const map: { [key: string]: number } = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    };

    let result = "";
    for (const key in map) {
      while (number >= map[key]) {
        result += key;
        number -= map[key];
      }
    }
    return result;
  }

  private static isDateFormat(format: string): boolean {
    const dateFormats = ["Y", "M", "D", "N"];
    return dateFormats.some((df) => format.includes(df));
  }

  private static formatDate(tglbukti: string, format: string): string {
    const date = new Date(tglbukti);
    const options: Intl.DateTimeFormatOptions = {};

    if (format.includes("Y")) options.year = "numeric";
    if (format.includes("M")) options.month = "2-digit";
    if (format.includes("D")) options.day = "2-digit";

    return new Intl.DateTimeFormat("en-GB", options).format(date);
  }

  private static formatNumber(lastRow: number, dynamicText: string): string {
    return String(lastRow + 1).padStart(dynamicText.length, "0");
  }

  private static tujuan(tujuan: number): string {
    return `T${tujuan}`;
  }

  private static marketing(marketing: number): string {
    return `M${marketing}`;
  }

  private static cabang(cabang: number): string {
    return `C${cabang}`;
  }

  private static jenisbiaya(jenisbiaya: number): string {
    return `J${jenisbiaya}`;
  }
}

export async function RunningNumberServiceHelper(
  text: string,
  a: number,
  bulan: number,
  tanggal: string
) {
  const options: FormatOptions = {
    lastRow: 0,
    bulan: bulan,
    tglbukti: tanggal,
    // tujuan: 0,
    // cabang: 0,
    // jenisbiaya: 0,
    // marketing: 0,
    statusformat: 0,
  };

  const result = RunningNumberHelper.getFormat(text, options);

  return result;
}

export async function GenerateRunningNumberService(
  text: string,
  lastRow: any,
  bulan: number,
  tanggal: string,
  tableName:string
) {
 
  const options: FormatOptions = {
    lastRow: lastRow,
    bulan: bulan,
    tglbukti: tanggal,
    tujuan: 0,
    cabang: 0,
    jenisbiaya: 0,
    marketing: 0,
    statusformat: 0,
    table: tableName,
  };

    const result = await RunningNumber.getFormat(text, options);

    return result
}
