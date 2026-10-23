/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dev-only "N" badge sat on top of the bottom navigation. Errors still show while developing.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
