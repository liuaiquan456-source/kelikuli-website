import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.aliyuncs.com" },
      // Custom Lab product images, including the original catalog host.
      {
        protocol: "https",
        hostname: "custom.kelikuli.com",
        port: "",
        pathname: "/media/products/**",
      },
      {
        protocol: "https",
        hostname: "kelikuli-resin-studio.jocund-box-4674.chatgpt.site",
        port: "",
        pathname: "/media/products/**",
      },
    ],
  },
};

export default nextConfig;
