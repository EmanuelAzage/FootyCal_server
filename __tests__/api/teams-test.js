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

it('should return status of 200 and a list of teams', (done) => {
  frisby
    .get('http://localhost:8080/api/allteams')
    .expect('status', 200)
    .expect('jsonTypes', '*', {
      id: Joi.number().integer()
    })
    .done(done);
});

it('should return status of 200 and the created user', (done) => {
    frisby
      .post('http://localhost:8080/auth/create_user', {
        id: -10,
        email: "testemail",
        password: "testpassword"
      })
      .expect('status', 200)
      .expect('json', 'email', 'testemail')
      .done(done);
});

it('should return status of 200 after updating teams list for user', (done) => {
    frisby
      .patch('http://localhost:8080/api/update_user_teams', {
        id: -10,
        email: "testemail",
        password: "testpassword",
        teams: [{id: 81, name: "FC Barcelona"}]
      })
      .expect('status', 200)
      .done(done);
});

it('should return status of 200 after deleting teams list for user', (done) => {
    frisby
      .delete('http://localhost:8080/api/delete_teams', {
        id: -10,
        email: "testemail",
        password: "testpassword"
      })
      .expect('status', 200)
      .done(done);
});
