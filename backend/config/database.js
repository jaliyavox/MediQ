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
    // On a host there is no .env file - the value comes from the service's
    // environment settings - so point at the right place depending on where
    // this is running.
    throw new Error(
      process.env.RENDER
        ? 'MONGO_URI is missing. Set it under Environment on the Render service, then redeploy.'
        : 'MONGO_URI is missing. Run npm run setup, then fill in backend/.env.'
    );
  }

  configureDns();
  return mongoose.connect(process.env.MONGO_URI);
}

module.exports = { connectDatabase };
