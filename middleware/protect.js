const jwt = require('jsonwebtoken');
module.exports = function(request, response, next) {

  try {
    let [type, token] = request.header('Authorization').split(' ');
    jwt.verify(token, process.env.SECRET_KEY); // throws error if verify fails
    next();
  }  catch (error) {
    console.log(error);

    response.status(422).json({
      error: "Request must provide an Authorization header with a valid token"
    });
  }

}
