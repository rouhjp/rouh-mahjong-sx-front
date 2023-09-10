/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/questions',
        permanent: true,
      }
    ]
  }
}

module.exports = nextConfig
