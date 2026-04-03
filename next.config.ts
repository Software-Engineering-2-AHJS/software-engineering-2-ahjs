/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This tells Next.js to allow the tunnel URL to request assets
    allowedDevOrigins: ["*.loca.lt", "pretty-maps-warn.loca.lt"],
  },
};

export default nextConfig;
