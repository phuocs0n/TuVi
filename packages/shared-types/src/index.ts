/** Khớp với `LaSoRequest` ở apps/api/app/main.py */
export interface LaSoRequest {
  nam_am: number;
  thang_am: number;
  gio: number;
}

/** Khớp với `LaSoCoBan.to_dict()` ở packages/laso-engine */
export interface LaSoResponse {
  nam: string;
  menh_nap_am: string;
  cung_menh: string;
  cung_than: string;
  cuc: string;
}
