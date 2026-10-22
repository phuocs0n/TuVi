/** Khớp với `LaSoRequest` ở apps/api/app/main.py */
export interface LaSoRequest {
  ho_ten: string;
  gioi_tinh: "nam" | "nu";
  ngay: number;
  thang: number;
  nam: number;
  /** Giờ sinh 0–23 */
  gio: number;
  lich: "duong" | "am";
  nhuan: boolean;
}

export interface LuanGiaiRequest extends LaSoRequest {
  cau_hoi?: string;
}

/** Khớp với `Sao.to_dict()` ở packages/laso-engine */
export interface Sao {
  ten: string;
  hoa: "Lộc" | "Quyền" | "Khoa" | "Kỵ" | null;
}

/** Khớp với `Cung.to_dict()` */
export interface Cung {
  chi: string;
  can: string;
  ten_cung: string;
  chinh_tinh: Sao[];
  phu_tinh: Sao[];
  dai_han: { tu: number; den: number };
  truong_sinh: string;
  thai_tue: string;
  bac_si: string;
  la_than: boolean;
  tuan: boolean;
  triet: boolean;
}

/** Khớp với `LaSo.to_dict()` */
export interface LaSo {
  ho_ten: string;
  gioi_tinh: "nam" | "nu";
  duong_lich: { ngay: number; thang: number; nam: number; gio: number; gio_chi: string };
  am_lich: { ngay: number; thang: number; nam: number; nhuan: boolean };
  can_chi_nam: string;
  nap_am: string;
  am_duong: "Âm" | "Dương";
  cuc: string;
  cung_menh: string;
  cung_than: string;
  than_cu: string;
  chieu_dai_han: "Thuận" | "Nghịch";
  /** 12 cung theo thứ tự Địa Chi: Tý, Sửu, ..., Hợi */
  cung: Cung[];
}

export interface LuanGiaiResponse {
  la_so: LaSo;
  luan_giai: string;
}
