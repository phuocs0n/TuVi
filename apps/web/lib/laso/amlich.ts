/**
 * Đổi lịch dương <-> âm lịch Việt Nam (thuật toán Hồ Ngọc Đức, múi giờ UTC+7).
 * Bản TypeScript của packages/laso-engine/amlich.py — giữ nguyên từng bước tính.
 */

const TZ = 7.0;
const EPOCH = 2415021.076998695;
const SYNODIC = 29.530588853;
const { floor, PI, sin } = Math;

export interface NgayAm {
  ngay: number;
  thang: number;
  nam: number;
  nhuan: boolean;
}

export interface NgayDuong {
  ngay: number;
  thang: number;
  nam: number;
}

const SO_NGAY_THANG = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function ngayDuongHopLe(ngay: number, thang: number, nam: number): boolean {
  if (![ngay, thang, nam].every(Number.isInteger) || nam < 1 || thang < 1 || thang > 12) return false;
  const nhuan = (nam % 4 === 0 && nam % 100 !== 0) || nam % 400 === 0;
  return ngay >= 1 && ngay <= SO_NGAY_THANG[thang - 1] + (thang === 2 && nhuan ? 1 : 0);
}

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  return (
    dd + floor((153 * m + 2) / 5) + 365 * y + floor(y / 4) - floor(y / 100) + floor(y / 400) - 32045
  );
}

function jdToDate(jd: number): NgayDuong {
  const a = jd + 32044;
  const b = floor((4 * a + 3) / 146097);
  const c = a - floor((b * 146097) / 4);
  const d = floor((4 * c + 3) / 1461);
  const e = c - floor((1461 * d) / 4);
  const m = floor((5 * e + 2) / 153);
  return {
    ngay: e - floor((153 * m + 2) / 5) + 1,
    thang: m + 3 - 12 * floor(m / 10),
    nam: b * 100 + d - 4800 + floor(m / 10),
  };
}

function newMoon(k: number): number {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t * t * t;
  const dr = PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
  jd1 += 0.00033 * sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);
  const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
  const mpr = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
  const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
  let c1 = (0.1734 - 0.000393 * t) * sin(m * dr) + 0.0021 * sin(2 * dr * m);
  c1 -= 0.4068 * sin(mpr * dr) - 0.0161 * sin(dr * 2 * mpr);
  c1 -= 0.0004 * sin(dr * 3 * mpr);
  c1 += 0.0104 * sin(dr * 2 * f) - 0.0051 * sin(dr * (m + mpr));
  c1 -= 0.0074 * sin(dr * (m - mpr)) - 0.0004 * sin(dr * (2 * f + m));
  c1 -= 0.0004 * sin(dr * (2 * f - m)) + 0.0006 * sin(dr * (2 * f + mpr));
  c1 += 0.001 * sin(dr * (2 * f - mpr)) + 0.0005 * sin(dr * (2 * mpr + m));
  const delta =
    t < -11
      ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
      : -0.000278 + 0.000265 * t + 0.000262 * t2;
  return jd1 + c1 - delta;
}

/** Chỉ số 0..11 của cung hoàng đạo (mỗi cung 30°) mà Mặt Trời đang ở. */
function sunLongitudeIndex(jdn: number): number {
  const t = (jdn - 2451545.0) / 36525;
  const t2 = t * t;
  const dr = PI / 180;
  const m = 357.5291 + 35999.0503 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
  let dl = (1.9146 - 0.004817 * t - 0.000014 * t2) * sin(dr * m);
  dl += (0.019993 - 0.000101 * t) * sin(dr * 2 * m) + 0.00029 * sin(dr * 3 * m);
  let lon = (l0 + dl) * dr;
  lon -= PI * 2 * floor(lon / (PI * 2));
  return floor((lon / PI) * 6);
}

const sunLongitude = (dayNumber: number) => sunLongitudeIndex(dayNumber - 0.5 - TZ / 24.0);

const newMoonDay = (k: number) => floor(newMoon(k) + 0.5 + TZ / 24.0);

function lunarMonth11(yy: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = floor(off / SYNODIC);
  let nm = newMoonDay(k);
  if (sunLongitude(nm) >= 9) nm = newMoonDay(k - 1);
  return nm;
}

function leapMonthOffset(a11: number): number {
  const k = floor((a11 - EPOCH) / SYNODIC + 0.5);
  let i = 1;
  let arc = sunLongitude(newMoonDay(k + i));
  for (;;) {
    const last = arc;
    i += 1;
    arc = sunLongitude(newMoonDay(k + i));
    if (arc === last || i >= 14) break;
  }
  return i - 1;
}

/** Đổi ngày dương lịch sang âm lịch. */
export function duongSangAm(ngay: number, thang: number, nam: number): NgayAm {
  if (!ngayDuongHopLe(ngay, thang, nam)) {
    throw new RangeError(`Ngày dương lịch không hợp lệ: ${ngay}/${thang}/${nam}`);
  }
  const dayNumber = jdFromDate(ngay, thang, nam);
  const k = floor((dayNumber - EPOCH) / SYNODIC);
  let monthStart = newMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = newMoonDay(k);
  let a11 = lunarMonth11(nam);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = nam;
    a11 = lunarMonth11(nam - 1);
  } else {
    lunarYear = nam + 1;
    b11 = lunarMonth11(nam + 1);
  }
  const diff = floor((monthStart - a11) / 29);
  let nhuan = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapDiff = leapMonthOffset(a11);
    if (diff >= leapDiff) {
      lunarMonth = diff + 10;
      nhuan = diff === leapDiff;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { ngay: dayNumber - monthStart + 1, thang: lunarMonth, nam: lunarYear, nhuan };
}

/** Đổi ngày âm lịch sang dương lịch. Báo RangeError nếu ngày âm không tồn tại. */
export function amSangDuong(ngay: number, thang: number, nam: number, nhuan = false): NgayDuong {
  if (!(thang >= 1 && thang <= 12 && ngay >= 1 && ngay <= 30)) {
    throw new RangeError(`Ngày âm lịch không hợp lệ: ${ngay}/${thang}/${nam}`);
  }
  const [a11, b11] =
    thang < 11 ? [lunarMonth11(nam - 1), lunarMonth11(nam)] : [lunarMonth11(nam), lunarMonth11(nam + 1)];
  const k = floor(0.5 + (a11 - EPOCH) / SYNODIC);
  let off = (((thang - 11) % 12) + 12) % 12;
  if (b11 - a11 > 365) {
    const leapOff = leapMonthOffset(a11);
    const leapMonth = (((leapOff - 2) % 12) + 12) % 12;
    if (nhuan && thang !== leapMonth) throw new RangeError(`Năm ${nam} không có tháng ${thang} nhuận`);
    if (nhuan || off >= leapOff) off += 1;
  } else if (nhuan) {
    throw new RangeError(`Năm ${nam} không có tháng nhuận`);
  }
  const result = jdToDate(newMoonDay(k + off) + ngay - 1);
  const back = duongSangAm(result.ngay, result.thang, result.nam);
  if (back.ngay !== ngay || back.thang !== thang || back.nam !== nam || back.nhuan !== nhuan) {
    throw new RangeError(`Ngày âm lịch không tồn tại: ${ngay}/${thang}/${nam}`);
  }
  return result;
}
