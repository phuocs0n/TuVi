/**
 * Ý nghĩa các sao dùng cho luận giải theo quy tắc (không dùng AI).
 * Nội dung theo cách luận Tử Vi phổ biến, viết ở giọng tham khảo, tích cực.
 * Chưa xét độ miếu/vượng/đắc/hãm của sao — các phái lập bảng khác nhau.
 */

export interface YNghiaChinhTinh {
  /** Bản chất sao, dùng khi luận đại hạn */
  tinh: string;
  menh: string;
  quanLoc: string;
  taiBach: string;
  phuThe: string;
  sucKhoe: string;
}

export const CHINH_TINH: Record<string, YNghiaChinhTinh> = {
  "Tử Vi": {
    tinh: "đế tinh, chủ về uy quyền, sự tự trọng và khả năng lãnh đạo",
    menh: "Người có phong thái đĩnh đạc, tự trọng cao, thích làm chủ và dễ được người khác nể; điểm cần lưu ý là đôi khi cả nể hoặc khó chấp nhận ý kiến trái chiều.",
    quanLoc: "hợp vai trò quản lý, điều hành, làm việc trong tổ chức lớn hoặc khu vực nhà nước; dễ được cất nhắc lên vị trí có trách nhiệm.",
    taiBach: "tài chính có nền tảng vững, kiếm tiền nhờ vị thế và uy tín hơn là nhờ may rủi.",
    phuThe: "người phối ngẫu có cá tính mạnh, tự trọng; hôn nhân bền khi hai bên tôn trọng nhau, tránh tranh quyền quyết định.",
    sucKhoe: "tỳ vị, tiêu hóa",
  },
  "Thiên Cơ": {
    tinh: "sao mưu trí, chủ về suy tính, sự linh hoạt và biến động",
    menh: "Thông minh, nhanh nhạy, giỏi tính toán và thích tìm hiểu cái mới; dễ suy nghĩ nhiều, hay thay đổi kế hoạch.",
    quanLoc: "hợp các nghề dùng trí óc như kỹ thuật, công nghệ, tư vấn, nghiên cứu, hoạch định; công việc có thể thay đổi nhiều lần.",
    taiBach: "tiền bạc đến từ chất xám và kế hoạch; thu nhập có lúc lên xuống nên cần quỹ dự phòng.",
    phuThe: "người phối ngẫu thông minh, nhanh nhẹn; tình cảm dễ có thay đổi nên cần sự thấu hiểu, trò chuyện thường xuyên.",
    sucKhoe: "gan mật, thần kinh, tay chân",
  },
  "Thái Dương": {
    tinh: "mặt trời, chủ về danh tiếng, sự rộng lượng và cho đi",
    menh: "Cởi mở, nhiệt tình, thẳng thắn, thích giúp người và coi trọng danh dự; cần tránh ôm đồm, làm nhiều mà ít được ghi nhận.",
    quanLoc: "hợp công việc giao tiếp, giáo dục, truyền thông, hoạt động xã hội — những nơi cần tiếng tăm và sự tin cậy.",
    taiBach: "kiếm tiền nhờ danh tiếng và các mối quan hệ; dễ chi tiêu rộng rãi cho người khác.",
    phuThe: "người phối ngẫu nhiệt tình, có thể bận rộn với công việc; nên dành thời gian riêng cho gia đình.",
    sucKhoe: "mắt, đầu, huyết áp",
  },
  "Vũ Khúc": {
    tinh: "tài tinh, chủ về tiền bạc, ý chí và sự quyết đoán",
    menh: "Cương nghị, thực tế, làm việc dứt khoát và có trách nhiệm; đôi khi cứng nhắc, ít biểu lộ tình cảm.",
    quanLoc: "hợp tài chính, ngân hàng, kinh doanh, kỹ thuật, các ngành cần kỷ luật cao.",
    taiBach: "cách tốt cho tài lộc, biết kiếm và biết giữ tiền, tích lũy bền theo thời gian.",
    phuThe: "tính cách hai bên dễ cứng rắn, nên mềm mỏng; lập gia đình muộn thường thuận hơn.",
    sucKhoe: "phổi, đường hô hấp",
  },
  "Thiên Đồng": {
    tinh: "phúc tinh, chủ về sự hòa nhã, an hưởng",
    menh: "Hiền hòa, dễ gần, lạc quan, thích cuộc sống an nhàn; cần thêm ý chí và kỷ luật để không bỏ lỡ cơ hội.",
    quanLoc: "hợp công việc ổn định, dịch vụ, chăm sóc, văn hóa – nghệ thuật; khởi đầu chậm nhưng về sau ổn định.",
    taiBach: "tài lộc đến từ từ, thường đủ dùng; nên tránh tiêu xài theo cảm hứng.",
    phuThe: "hôn nhân êm ấm, người phối ngẫu hiền lành; cần chủ động vun đắp để tình cảm không nhạt.",
    sucKhoe: "thận, bàng quang, đường tiết niệu",
  },
  "Liêm Trinh": {
    tinh: "sao chủ về nguyên tắc, cá tính và sự tranh đấu",
    menh: "Có nguyên tắc, mạnh mẽ, dám nghĩ dám làm và nhiều hoài bão; cần kiềm chế sự nóng nảy, giữ chừng mực.",
    quanLoc: "hợp pháp luật, hành chính, kỹ thuật, quân đội – công an, những việc đòi hỏi bản lĩnh xử lý vấn đề khó.",
    taiBach: "kiếm tiền bằng năng lực và cạnh tranh; nên minh bạch, tránh đi đường tắt.",
    phuThe: "tình cảm sâu sắc nhưng dễ va chạm; hai bên cần biết nhường nhịn.",
    sucKhoe: "tim mạch, máu huyết",
  },
  "Thiên Phủ": {
    tinh: "kho tài, chủ về sự ổn định và tích lũy",
    menh: "Điềm đạm, chín chắn, chu đáo, biết lo xa; hợp vai trò quản lý, gìn giữ. Đôi khi hơi bảo thủ, ngại thay đổi.",
    quanLoc: "hợp quản lý tài sản, hành chính, tài chính, những công việc ổn định lâu dài.",
    taiBach: "rất tốt cho việc giữ của; tài sản tích lũy đều đặn theo thời gian.",
    phuThe: "hôn nhân ổn định, người phối ngẫu chu đáo, biết vun vén.",
    sucKhoe: "tỳ vị, dạ dày",
  },
  "Thái Âm": {
    tinh: "mặt trăng, chủ về điền sản, sự tinh tế và dịu dàng",
    menh: "Tinh tế, nhạy cảm, sống tình cảm, có óc thẩm mỹ; đôi khi đa sầu, thiếu quyết đoán.",
    quanLoc: "hợp tài chính, bất động sản, nghệ thuật, giáo dục và các công việc cần sự tỉ mỉ.",
    taiBach: "tốt cho tích lũy và bất động sản; tiền đến đều và bền.",
    phuThe: "người phối ngẫu dịu dàng, chu đáo; tình cảm sâu sắc.",
    sucKhoe: "thận, mắt, nội tiết",
  },
  "Tham Lang": {
    tinh: "sao chủ về tài nghệ, giao tế và ham muốn",
    menh: "Đa tài, khéo giao tiếp, ham học hỏi và thích trải nghiệm; cần tiết chế ham muốn, tránh làm nhiều việc dàn trải.",
    quanLoc: "hợp kinh doanh, ngoại giao, nghệ thuật, giải trí, ẩm thực và các ngành cần quan hệ rộng.",
    taiBach: "kiếm tiền nhanh nhờ giao tế và biết nắm cơ hội; cần cẩn trọng với đầu cơ, cờ bạc.",
    phuThe: "tình cảm phong phú, dễ có nhiều mối quan hệ; sự chung thủy là chìa khóa giữ hạnh phúc.",
    sucKhoe: "gan, thận, hệ sinh dục",
  },
  "Cự Môn": {
    tinh: "ám tinh, chủ về ngôn ngữ, lý lẽ và thị phi",
    menh: "Có tài ăn nói, lý luận sắc bén, óc phân tích và hoài nghi; dễ vướng thị phi nên cần cẩn trọng lời nói.",
    quanLoc: "hợp các nghề dùng lời nói và chuyên môn như luật, giảng dạy, tư vấn, bán hàng, truyền thông, nghiên cứu.",
    taiBach: "kiếm tiền bằng miệng lưỡi và chuyên môn; nên làm hợp đồng rõ ràng để tránh tranh chấp.",
    phuThe: "vợ chồng dễ bất đồng, khẩu chiến; nên lắng nghe nhiều hơn và nói nhẹ nhàng.",
    sucKhoe: "tiêu hóa, răng miệng",
  },
  "Thiên Tướng": {
    tinh: "ấn tinh, chủ về sự trợ giúp và công bằng",
    menh: "Đàng hoàng, chính trực, thích giúp đỡ và hòa giải; coi trọng uy tín và hình thức.",
    quanLoc: "hợp vai trò phò tá, quản lý nhân sự, hành chính, pháp lý, dịch vụ chuyên nghiệp.",
    taiBach: "tài lộc ổn định, dễ được người khác giúp đỡ về tiền bạc.",
    phuThe: "người phối ngẫu đứng đắn, biết lo toan; hôn nhân hòa thuận.",
    sucKhoe: "da, bàng quang",
  },
  "Thiên Lương": {
    tinh: "ấm tinh, chủ về sự che chở, phúc thọ",
    menh: "Nhân hậu, chín chắn, thích che chở người khác, có tư chất của người thầy; đôi khi hay khuyên bảo quá mức.",
    quanLoc: "hợp y tế, giáo dục, bảo hiểm, công tác xã hội, tư vấn, công chức.",
    taiBach: "tài lộc vừa đủ, hay gặp may vào lúc khó; không nên đầu cơ lớn.",
    phuThe: "người phối ngẫu chín chắn, có thể lớn tuổi hơn; hôn nhân bền.",
    sucKhoe: "dạ dày (thường có sức đề kháng tốt)",
  },
  "Thất Sát": {
    tinh: "tướng tinh, chủ về uy dũng và khai phá",
    menh: "Mạnh mẽ, quả cảm, độc lập, dám mạo hiểm; cuộc đời nhiều thăng trầm nhưng có cơ hội làm nên việc lớn. Cần kiên nhẫn, tránh nóng vội.",
    quanLoc: "hợp khởi nghiệp, kỹ thuật, quân sự và những việc cần xông pha, mở đường.",
    taiBach: "tiền bạc lúc nhiều lúc ít, được mất nhanh; nên giữ quỹ dự phòng.",
    phuThe: "hôn nhân dễ sóng gió nếu cả hai đều cứng; lập gia đình muộn hoặc tìm hiểu kỹ thì thuận hơn.",
    sucKhoe: "hô hấp, chấn thương khi vận động",
  },
  "Phá Quân": {
    tinh: "hao tinh, chủ về phá cũ lập mới",
    menh: "Thích đổi mới, dám phá bỏ khuôn khổ, có tinh thần tiên phong; dễ thay đổi chỗ làm, nơi ở. Cần bền bỉ để giữ thành quả.",
    quanLoc: "hợp ngành sáng tạo, cải cách, kỹ thuật, kinh doanh mạo hiểm; sự nghiệp có thể chuyển hướng nhiều lần.",
    taiBach: "tiền vào ra mạnh, dễ hao tán; nên tích lũy có kế hoạch.",
    phuThe: "tình cảm dễ thay đổi; cần kiên nhẫn và cam kết.",
    sucKhoe: "khí huyết, thận, tai nạn bất ngờ",
  },
};

/** Lục cát tinh và các sao tốt thường dùng */
export const CAT_TINH: Record<string, string> = {
  "Tả Phù": "được quý nhân, bạn bè, cộng sự hỗ trợ",
  "Hữu Bật": "được quý nhân, bạn bè, cộng sự hỗ trợ",
  "Văn Xương": "thông minh, học hành và văn chương tốt",
  "Văn Khúc": "thông minh, học hành và văn chương tốt",
  "Thiên Khôi": "gặp quý nhân nâng đỡ, có cơ hội thăng tiến",
  "Thiên Việt": "gặp quý nhân nâng đỡ, có cơ hội thăng tiến",
  "Lộc Tồn": "có lộc, biết giữ của, tính cẩn trọng",
  "Thiên Mã": "năng động, hay di chuyển, đi xa dễ thành công",
};

/** Lục sát tinh — gặp nhiều thì cuộc sống nhiều thử thách hơn */
export const SAT_TINH: Record<string, string> = {
  "Kình Dương": "quyết liệt nhưng dễ va chạm, xung đột",
  "Đà La": "chậm trễ, dây dưa, trở ngại ngầm",
  "Hỏa Tinh": "nóng nảy, biến động đột ngột",
  "Linh Tinh": "lo âu ngầm, biến cố bất ngờ",
  "Địa Không": "hao tán, được mất thất thường, ý tưởng dễ viển vông",
  "Địa Kiếp": "hao tán, được mất thất thường, ý tưởng dễ viển vông",
};

/** Các sao phụ khác có ý nghĩa đáng nói */
export const SAO_KHAC: Record<string, string> = {
  "Tam Thai": "có địa vị, được tôn trọng",
  "Bát Tọa": "có địa vị, được tôn trọng",
  "Ân Quang": "được ơn huệ, có phúc đức",
  "Thiên Quý": "được ơn huệ, có phúc đức",
  "Thiên Hình": "kỷ luật, nghiêm khắc; dễ dính chuyện pháp lý hoặc phẫu thuật",
  "Thiên Riêu": "đa tình, dễ sa đà vui chơi",
  "Cô Thần": "tính cô độc, ít chia sẻ",
  "Quả Tú": "tính cô độc, ít chia sẻ",
  "Thiên Khốc": "hay lo nghĩ, buồn phiền",
  "Thiên Hư": "hay lo nghĩ, buồn phiền",
};

/** Nhóm sao đào hoa — chỉ luận ở Mệnh và Phu Thê */
export const DAO_HOA: Record<string, string> = {
  "Đào Hoa": "duyên dáng, dễ thu hút người khác",
  "Hồng Loan": "duyên dáng, dễ thu hút người khác",
  "Thiên Hỷ": "vui vẻ, có tin mừng",
};

export const TU_HOA: Record<string, string> = {
  Lộc: "thêm thuận lợi, cơ hội và tài lộc",
  Quyền: "thêm quyền hành, sự chủ động và sức ảnh hưởng",
  Khoa: "thêm danh tiếng, học vấn và quý nhân giúp đỡ",
  Kỵ: "dễ vướng mắc, thị phi hoặc lo lắng, cần thận trọng",
};

/** Lĩnh vực mà mỗi cung chủ về, dùng để nói Hóa Kỵ và đại hạn rơi vào đâu */
export const LINH_VUC_CUNG: Record<string, string> = {
  "Mệnh": "bản thân, tính cách",
  "Phụ Mẫu": "cha mẹ, giấy tờ, học hành",
  "Phúc Đức": "đời sống tinh thần, họ hàng",
  "Điền Trạch": "nhà cửa, đất đai",
  "Quan Lộc": "công việc, sự nghiệp",
  "Nô Bộc": "bạn bè, cộng sự, người dưới quyền",
  "Thiên Di": "đi xa, quan hệ bên ngoài",
  "Tật Ách": "sức khỏe",
  "Tài Bạch": "tiền bạc",
  "Tử Tức": "con cái",
  "Phu Thê": "hôn nhân, tình cảm",
  "Huynh Đệ": "anh chị em",
};
