import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Chỉ chạy hiệu ứng khi người dùng không bật "giảm chuyển động" trong hệ điều hành. */
export const CHO_PHEP_CHUYEN_DONG = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
