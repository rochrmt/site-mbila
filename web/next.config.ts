import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Accès depuis le réseau local (ex. http://192.168.1.28:3000 sur un téléphone) en dev
  allowedDevOrigins: ["192.168.1.*", "10.*", "172.16.*", "172.17.*", "172.18.*", "172.19.*", "172.2*.*", "172.30.*", "172.31.*", "*.nip.io"],
  poweredByHeader: false,
  // Masque le badge « N » des DevTools en développement (invisible en production de toute façon)
  devIndicators: false,
};

export default nextConfig;
