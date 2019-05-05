const frisby = require('frisby');

const { Joi } = frisby;

it('should return status of 200 and an access token', () => {
  return frisby
          .post('http://localhost:8080/auth/token', {
            id: 16,
	          email: "test@usc.edu",
	          password: "$2y$10$wno8qKbpTAmuUw8Wb1RVF.kcTvwmqMTlmjzzZGRIIYtOnh3Wy1AqC"
          },)
          .expect('status', 200)
          .expect('jsonTypes', 'token', Joi.string());
});
