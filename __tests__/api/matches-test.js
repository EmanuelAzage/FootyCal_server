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

it('should return status of 404 for a non existent user', (done) => {
  frisby
    .get('http://localhost:8080/api/upcoming_matches/-1')
    .expect('status', 404)
    .done(done);
});

it('should return status of 200 and the upcoming matches for the user', (done) => {
    frisby
      .get('http://localhost:8080/api/upcoming_matches/16')
      .expect('status', 200)
      .expect('jsonTypes', '*', {
        id: Joi.number().integer(),
        date: Joi.string(),
        time: Joi.string(),
        home_team: Joi.string(),
        away_team: Joi.string()
      })
      .done(done);
});
