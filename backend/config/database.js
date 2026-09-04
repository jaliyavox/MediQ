const dns = require('node:dns');
const mongoose = require('mongoose');

function configureDns() {
  const servers = process.env.DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers?.length) {
    dns.setServers(servers);
  }
}

async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Run npm run setup, then fill in backend/.env.');
  }

  configureDns();
  return mongoose.connect(process.env.MONGO_URI);
}

module.exports = { connectDatabase };
