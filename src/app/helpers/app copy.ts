type FormatOptions = {
  lastRow: number;
  bulan: number;
  tglbukti: string;
  tujuan?: number;
  cabang?: number;
  jenisbiaya?: number;
  marketing?: number;
  statusformat?: number;
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

    format = format.replace(RunningNumberHelper.staticSeparatorFormat, ""); // Hapus karakter '|'

    // Pisahkan teks statis dan dinamis
    this.separateText(format, staticTexts, dynamicTexts, separatedResults);
    
    // Ganti bagian dinamis dengan nilai yang sesuai
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

    // Gabungkan kembali teks statis dan dinamis
    this.mergeTexts(separatedResults, staticTexts, dynamicTexts);

    if (statusformat !== 0) {
      const nobukti = separatedResults.join("");
      return `${nobukti}`;
    }

    return separatedResults.join("");
  }

  // Pisahkan teks statis dan dinamis
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

      if (char === RunningNumberHelper.staticSeparator) {
        totalSeparator++;
      }

      if (totalSeparator === 1) {
        if (char !== RunningNumberHelper.staticSeparator) {
          tempStaticText += char;
        } else {
          separatedResults.push(RunningNumberHelper.dynamicSeparator);
        }
      } else if (totalSeparator === 0) {
        if (char !== RunningNumberHelper.staticSeparator) {
          tempDynamicText += char;
        }
        if (i === format.length - 1) {
          dynamicTexts.push(tempDynamicText);
          separatedResults.push(RunningNumberHelper.dynamicSeparator);
        }
      } else {
        dynamicTexts.push(tempDynamicText);
        separatedResults.push(char);
      }

      if (totalSeparator === 2) {
        staticTexts.push(tempStaticText);
        totalSeparator = 0;
      }
    }
  }

  // Format teks dinamis dengan mengganti variabel
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
    dynamicTexts.forEach((dynamicText, index) => {
      switch (dynamicText.trim()) {
        case "R":
          dynamicTexts[index] = this.numberToRoman(bulan);
          break;
        case "T":
          dynamicTexts[index] = this.tujuan(tujuan || 0);
          break;
        case "M":
          dynamicTexts[index] = this.marketing(marketing || 0);
          break;
        case "C":
          dynamicTexts[index] = this.cabang(cabang || 0);
          break;
        case "J":
          dynamicTexts[index] = this.jenisbiaya(jenisbiaya || 0);
          break;
        case this.isDateFormat(dynamicText):
          dynamicTexts[index] = this.formatDate(tglbukti, dynamicText);
          break;
        case dynamicText.match(/^\d+$/)?.input:
          dynamicTexts[index] = this.formatNumber(
            lastRow,
            dynamicText,
            statusformat
          );
          break;
        default:
          break;
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
    let result = "";
    for (let key in map) {
      while (number >= map[key]) {
        result += key;
        number -= map[key];
      }
    }
    return result;
  }

  // Mengecek apakah format adalah tanggal
  private static isDateFormat(format: string): boolean {
    const dateFormats = ["y", "m", "d", "n"];
    return dateFormats.some((df) => format.includes(df));
  }

  // Mengformat tanggal
  private static formatDate(tglbukti: string, format: string): string {
    const date = new Date(tglbukti);
    const options: Intl.DateTimeFormatOptions = {};

    if (format.includes("y")) options.year = "numeric";
    if (format.includes("m")) options.month = "2-digit";
    if (format.includes("d")) options.day = "2-digit";

    return date.toLocaleDateString(undefined, options);
  }

  // Fungsi untuk memformat angka
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
    // Ambil dari database atau sumber lain sesuai implementasi Anda
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

export async function RunningNumberServiceHelper() {
  // Contoh penggunaan
  const format = "#KGT #9999#/#R#/#Y";
  const options: FormatOptions = {
    lastRow: 15,
    bulan: 3,
    tglbukti: "2024-03-15",
    tujuan: 1,
    cabang: 2,
    jenisbiaya: 5,
    marketing: 10,
    statusformat: 0,
  };

  const result = RunningNumberHelper.getFormat(format, options);
  console.log(result);
}
