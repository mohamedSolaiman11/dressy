import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أتيليه روز",
    short_name: "أتيليه",
    description: "واجهة إدارة أتيليه لتأجير فساتين الزفاف والسواريه",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f2ee",
    theme_color: "#9d5c68",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml"
      },
      {
        src: "/apple-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml"
      }
    ]
  };
}
