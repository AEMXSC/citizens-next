import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing root to this project. Other lockfiles exist higher up
  // the user's home directory, and without this Next infers the wrong root.
  outputFileTracingRoot: projectRoot,
  // We render Content Fragment images with a plain <picture> element (see
  // src/components/CFImage.tsx) rather than next/image, because AEM Dynamic
  // Media / Scene7 URLs carry query parameters that next/image would strip or
  // re-encode. No remotePatterns config is needed as a result.
};

export default nextConfig;
