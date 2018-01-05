
const loopbackApiTesting = require('./core');
const server = require('../server/server.js');
const url = 'http://localhost:3000/api/v1';
const path = require('path');
const app = require(path.resolve(__dirname, '../server/server'));
const fs = require('fs');

// Load testing environment
const testFolder = path.resolve(__dirname, './configs/');
// ------------------------

function autoTest (testFolder) {
  console.info(`Run product testing, on dir: ${testFolder}`);

  var files = fs.readdirSync(testFolder);

  var testConfigs = [];

  files.forEach(file => {
    const testConfig = require(`${testFolder}/${file}`);

    testConfigs = testConfigs.concat(testConfig);
  });

  loopbackApiTesting.run(testConfigs, server, url, function (err) {
    if (err) {
      console.log(err);
    }
  });
}

autoTest(testFolder);
