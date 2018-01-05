const supertest = require('supertest');
const async = require('async');
const assert = require('assert');
const lodash = require('lodash');

module.exports = {
  run: function (conf, app, url, callback) {
    var server,
      loginType;
    var agent = supertest.agent(url);
    var baseURL = '/';

    if (typeof conf !== 'object') {
      return callback('Failed to load test configuration from file');
    }

    if (app) {
      before(function (done) {
        server = app.listen(done);
      });

      after(function (done) {
        server.close(done);
      });
    }

    const storedResult = [];

    const resolveStoredVariable = val => {
      if (typeof(val) === 'object' && val.storedResult) {
        const accessor = val.storedResult.split('.')
        let result = Object.assign(storedResult);

        lodash.map(accessor, (val) => {
          result = result[val];
        })

        return result;
      } else {
        return val;
      }
    }

    async
      .each(conf, function (step, asyncCallback) {
        if (step.scenario) 
          describe(step.scenario, function () {
            async
              .each(step.testCase, function (c, asyncCallback) {
                if (!c.hasOwnProperty('method')) {
                  callback('Test has no method specified');
                  return asyncCallback();
                }

                if (!c.hasOwnProperty('model')) {
                  callback('Test has no route specified');
                  return asyncCallback();
                }

                if (!c.hasOwnProperty('expect')) {
                  callback('Test has no expected response code specified');
                  return asyncCallback();
                }

                const hasData = (c.hasOwnProperty('withData'));
                const hasCustomHeader = (c.hasOwnProperty('withHeader'));
                const isWithAuthentication = (c.hasOwnProperty('username') && c.hasOwnProperty('password'));
                const authenticationDescription = (isWithAuthentication)
                  ? 'authenticated'
                  : 'unauthenticated';

                var parsedMethod,
                  loginBlock,
                  description;

                if (c.description) 
                  description = c.description;
                else 
                  description = `should respond ${c.expect} on ${authenticationDescription} ${c.method} requests to /${c.model}`;
                
                if (c.method.toUpperCase() === 'GET') {
                  parsedMethod = agent.get(baseURL + c.model);
                } else if (c.method.toUpperCase() === 'POST') {
                  parsedMethod = agent.post(baseURL + c.model);
                } else if (c.method.toUpperCase() === 'PUT') {
                  parsedMethod = agent.put(baseURL + c.model);
                } else if (c.method.toUpperCase() === 'DELETE') {
                  parsedMethod = agent.delete(baseURL + c.model);
                } else if (c.method.toUpperCase() === 'PATCH') {
                  parsedMethod = agent.patch(baseURL + c.model);
                } else {
                  callback('Test has an unrecognized method type');
                  return asyncCallback();
                }

                if (isWithAuthentication) {
                  loginBlock = function (loginCallback) {
                    if (c.userType == 'users') 
                      loginType = baseURL + 'users/login';
                    else 
                      loginType = baseURL + 'admins/login';
                    
                    agent
                      .post(loginType)
                      .send({username: c.username, password: c.password, ttl: '1209600000'})
                      .set('Accept', 'application/json')
                      .set('Content-Type', 'application/json')
                      .expect(200)
                      .end(function (err, authRes) {
                        if (err) {
                          return loginCallback(err, null);
                        }

                        var token = authRes.body.id;

                        return loginCallback(null, token);
                      });
                  };
                } else {
                  loginBlock = function (loginCallback) {
                    return loginCallback(null, null);
                  };
                }

                it(description, function (done) {
                  loginBlock(function (loginError, loginToken) {
                    if (loginError) {
                      done(loginError);
                      return asyncCallback();
                    }

                    if (loginToken) {
                      parsedMethod = parsedMethod.set('Authorization', loginToken);
                    }

                    if (hasCustomHeader) {
                      lodash.map(c.withHeader, (val, key) => {
                        parsedMethod = parsedMethod.set(key, resolveStoredVariable(val));
                      })
                    }

                    if (hasData) {
                      let payloadData = {};
                      lodash.map(c.withData, (val, key) => {
                        payloadData[key] = resolveStoredVariable(val);
                      })

                      parsedMethod
                        .send(payloadData)
                        .set('Content-Type', 'application/json');
                    }

                    parsedMethod
                      .expect(c.expect)
                      .end(function (err, res) {
                        const resJson = JSON.parse(res.text);
                        if (err) {
                          done(err);
                        } else {
                          if (c.storedResult) {
                            storedResult[c.storedResult] = resJson
                          }
                          done();
                        }

                        return asyncCallback();
                      });
                  });
                });
              });
          });
        }
      );
  }
};
