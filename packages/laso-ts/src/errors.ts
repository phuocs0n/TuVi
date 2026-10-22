/** Lỗi dữ liệu đầu vào (ngày không tồn tại, giờ sai...). Thông báo là tiếng Việt, hiển thị được cho người dùng. */
export class LaSoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LaSoError";
  }
}
