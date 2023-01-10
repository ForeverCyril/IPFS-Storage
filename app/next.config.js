/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/ipfs',
        destination: 'http://ipfs.cyril.tech:8080/ipfs',
      },
      {
        source: '/ipfs/:cid*',
        destination: 'http://ipfs.cyril.tech:8080/ipfs/:cid*',
      },
    ]
  },
}

module.exports = nextConfig
