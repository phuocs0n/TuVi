"""Dựng prompt luận giải từ lá số + ngữ cảnh RAG."""

from typing import Any

SYSTEM_PROMPT = (
    "Bạn là chuyên gia Tử Vi Đẩu Số. Luận giải mang tính tham khảo, tích cực, "
    "không phán đoán tuyệt đối về sức khỏe, tài chính hay sinh tử. "
    "Chỉ dựa trên dữ kiện lá số và tài liệu tham khảo được cung cấp. "
    "Trình bày bằng tiếng Việt, chia mục rõ ràng: Tổng quan Mệnh - Thân, Công danh, "
    "Tài lộc, Tình duyên - Gia đạo, Sức khỏe, Lời khuyên."
)


def _sao(ds: list[dict[str, Any]]) -> str:
    return ", ".join(f"{s['ten']} (Hóa {s['hoa']})" if s.get("hoa") else s["ten"] for s in ds)


def format_la_so(la_so: dict[str, Any]) -> str:
    """Chuyển lá số (dict từ laso-engine) thành văn bản. Dict phẳng thì liệt kê key: value."""
    if "cung" not in la_so:
        return "\n".join(f"- {k}: {v}" for k, v in la_so.items())
    al = la_so["am_lich"]
    lines = [
        f"- Giới tính: {'Nam' if la_so['gioi_tinh'] == 'nam' else 'Nữ'}",
        f"- Năm sinh: {la_so['can_chi_nam']} ({la_so['am_duong']}), nạp âm {la_so['nap_am']}",
        f"- Âm lịch: ngày {al['ngay']} tháng {al['thang']}{' nhuận' if al['nhuan'] else ''}"
        f", giờ {la_so['duong_lich']['gio_chi']}",
        f"- Cục: {la_so['cuc']}; Mệnh tại {la_so['cung_menh']}, Thân cư {la_so['than_cu']}",
        f"- Đại hạn đi chiều {la_so['chieu_dai_han'].lower()}",
        "",
        "12 cung:",
    ]
    for c in la_so["cung"]:
        dh = c["dai_han"]
        tags = [
            t
            for t, on in (("Thân", c["la_than"]), ("Tuần", c["tuan"]), ("Triệt", c["triet"]))
            if on
        ]
        lines.append(
            f"- {c['ten_cung']} ({c['can']} {c['chi']}, đại hạn {dh['tu']}-{dh['den']})"
            f"{' [' + ', '.join(tags) + ']' if tags else ''}: "
            f"chính tinh: {_sao(c['chinh_tinh']) or 'vô chính diệu'}; "
            f"phụ tinh: {_sao(c['phu_tinh']) or 'không'}; {c['truong_sinh']}"
        )
    return "\n".join(lines)


def build_prompt(la_so: dict[str, Any], context_docs: list[str], cau_hoi: str) -> str:
    ngu_canh = "\n".join(f"<doc>{d}</doc>" for d in context_docs) or "<doc>(không có)</doc>"
    return (
        f"<tai_lieu>\n{ngu_canh}\n</tai_lieu>\n\n"
        f"<la_so>\n{format_la_so(la_so)}\n</la_so>\n\n"
        f"Câu hỏi: {cau_hoi}"
    )
