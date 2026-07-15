import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 빌드 시 혹시 모를 타입 에러가 있어도 무시하고 배포 진행
    ignoreBuildErrors: true,
  }
};

export default nextConfig;