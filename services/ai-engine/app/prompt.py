"""Dựng prompt luận giải từ lá số + ngữ cảnh RAG."""

SYSTEM_PROMPT = (
    "Bạn là chuyên gia Tử Vi Đẩu Số. Luận giải mang tính tham khảo, tích cực, "
    "không phán đoán tuyệt đối về sức khỏe, tài chính hay sinh tử. "
    "Chỉ dựa trên dữ kiện lá số và tài liệu tham khảo được cung cấp."
)


def build_prompt(la_so: dict[str, object], context_docs: list[str], cau_hoi: str) -> str:
    ngu_canh = "\n".join(f"<doc>{d}</doc>" for d in context_docs) or "<doc>(không có)</doc>"
    du_kien = "\n".join(f"- {k}: {v}" for k, v in la_so.items())
    return (
        f"<tai_lieu>\n{ngu_canh}\n</tai_lieu>\n\n<la_so>\n{du_kien}\n</la_so>\n\nCâu hỏi: {cau_hoi}"
    )
