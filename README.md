# Loopback Automatic Api Test
You can run API testing for loopback only by providing test configs inside directory ./configs/

## example test scenario config
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
