const frisby = require('frisby');

const { Joi } = frisby;

it('should return status of 200 and an access token', () => {
  return frisby
          .post('http://localhost:8080/auth/token', {
            id: 11,
	          email: "test@usc.edu",
	          password: "$2y$10$n/BHaNRFmTJwOvRMU0Ug2eAHpegZcL.bAc1n9tgoSRgTejZ6Yse1G"
          },)
          .expect('status', 200)
          .expect('jsonTypes', 'token', Joi.string());
});
