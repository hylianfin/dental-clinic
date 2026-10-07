import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 *
 * Note: `frame-ancestors` / `X-Frame-Options` are intentionally NOT set here.
 * The site must be embeddable in the hosting/preview iframe and any future
 * clinic CRM/portal embedding. If you deploy behind a CDN (Vercel, Cloudflare,
 * Nginx) and want clickjacking protection for the public site, add it at the
 * edge for the production domain only. See README → "Deployment hardening".
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://*.supabase.co",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${isProd ? "" : " ws: wss:"}`,
  "frame-src https://www.google.com https://maps.google.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage — lets the admin dashboard serve uploaded media.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    /**
     * Pages are served with `no-cache, must-revalidate` so a shared cache (a CDN
     * or the hosting preview proxy) can never pin an old build for months —
     * Next's default `s-maxage=31536000` on prerendered pages does exactly that,
     * which makes replaced photographs look like they never changed. Hashed
     * build assets under `/_next/static` keep their immutable caching.
     */
    const freshPages = [
      { key: "Cache-Control", value: "no-cache, must-revalidate" },
    ];

    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/", headers: freshPages },
      { source: "/about", headers: freshPages },
      { source: "/services", headers: freshPages },
      { source: "/gallery", headers: freshPages },
      { source: "/contact", headers: freshPages },
      { source: "/appointment", headers: freshPages },
      { source: "/legal/:slug*", headers: freshPages },
    ];
  },
};

export default nextConfig;
