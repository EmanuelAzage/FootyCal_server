const frisby = require('frisby');

const { Joi } = frisby;

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IiQyeSQxMCRuL0JIYU5SRm1USndPdlJNVTBVZzJlQUhwZWdaY0wuYkFjMW45dGdvU1JnVGVqWjZZc2UxRyIsImlhdCI6MTU1NzAwODc4M30.j484orWb2KvN3q24K-WkQyxQ2RPZl_7OabZMabFJZrs';

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
      .get('http://localhost:8080/api/upcoming_matches/11')
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
