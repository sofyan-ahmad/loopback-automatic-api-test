# Loopback Automatic Api Test
You can run API testing for loopback, just by providing test configs inside directory `./configs/`.
No more hassle writing long+repetitive scenario and assertion

## Setup
- install mocha, supertest, instanbul, and nyc
```bash
npm install -s mocha nyc supertest instanbul
```
- clone this repository as sub module to your loopback project root directory
```bash
git submodule add https://github.com/sofyanhadia/loopback-automatic-api-test.git
```
- inside your package.json add scripts
```json
"scripts": {
    ...
    "test": "nyc mocha test",
    "coverage": "NODE_ENV=test nyc --reporter=text mocha"
  },
```


## Example test scenario config
```json
[{
  "scenario": "Admin Login",
  "testCase": [{
    "method": "POST",
    "model": "admins/login",
    "withData": {
      "username": "admin",
      "password": "admin"
    },
    "expect": 200,
    "storedResult": "adminLoginData" // store result with name `adminLoginData`
  }]
}, 
{
  "scenario": "Access admin form without token",
  "testCase": [{
    "method": "GET",
    "model": "admins/form",
    "expect": 401
  }]
}, {
  "scenario": "Access admin form with token",
  "testCase": [{
    "method": "GET",
    "model": "admins/form",
    "withHeader": {
      "authorization": {
        "storedResult": "adminLoginData.id"  // access stored `adminLoginData` with property `id`
      }
    },
    "expect": 200
  }]
}]
```
