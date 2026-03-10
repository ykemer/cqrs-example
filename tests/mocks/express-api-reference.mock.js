module.exports = {
  apiReference: function apiReference(/*opts*/) {
    // return an express middleware compatible function
    return function _apiReferenceMiddleware(req, res, next) {
      return next();
    };
  },
};
