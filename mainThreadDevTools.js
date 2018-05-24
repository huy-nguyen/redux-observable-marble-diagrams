require('dotenv').config();
const {
  mainThreadReduxDevToolsPort,
} = require('./buildConstants');

const remotedev = require('remotedev-server');

const startServer = async () => {
  try {
    await remotedev({ hostname: 'localhost', port: mainThreadReduxDevToolsPort});
  } catch(e) {
    console.error('Error: ' + e);
  }
};

startServer();
