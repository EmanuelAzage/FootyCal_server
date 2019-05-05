const frisby = require('frisby');

const { Joi } = frisby;

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IiQyeSQxMCR3bm84cUticFRBbXVVdzhXYjFSVkYua2NUdndtcU1UbG1qenpaR1JJSVl0T25oM1d5MUFxQyIsImlhdCI6MTU1NzAyNzA4Nn0.OdN9myU0tWxK4i9OMLahbHfelOJpyCtNq1u_hRJma3k';

frisby.globalSetup({
  request: {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    }
  }
});

it('should return status of 404 when the user is not found', (done) => {
  frisby
    .get('http://localhost:8080/api/user/-1')
    .expect('status', 404)
    .done(done);
});

it('should return status of 200 and the user when it is found', (done) => {
    frisby
      .get('http://localhost:8080/api/user/16')
      .expect('status', 200)
      .expect('json', 'email', 'test@usc.edu')
      .done(done);
});
