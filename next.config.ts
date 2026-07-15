/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // 빌드 시 에스린트 에러가 있어도 무시하고 배포 진행
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 타입 에러가 있어도 무시하고 배포 진행
    ignoreBuildErrors: true,
  }
};

export default nextConfig;