import localFont from "next/font/local";

// ----------------------------------------------------------->
// IBMPlexSansArabic
// ----------------------------------------------------------->
// ----------------------------------------------------------->
// ----------------------------------------------------------->
export const ibmPlexSansArabic = localFont({
  src: [
    {
      path: "../../public/fonts/IBMPlexSansArabic-Regular-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBMPlexSansArabic-Medium-500.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBMPlexSansArabic-SemiBold-600.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBMPlexSansArabic-Bold-700.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
});

// ----------------------------------------------------------->
// KawkabMonoArabic
// ----------------------------------------------------------->
// ----------------------------------------------------------->
// ----------------------------------------------------------->
export const kawkabMonoArabic = localFont({
  src: [
    {
      path: "../../public/fonts/KawkabMonoArabic-Regular-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/KawkabMonoArabic-Bold-700.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
});
