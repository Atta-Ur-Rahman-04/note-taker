module.exports = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch(next);
  };
};

// catch will catch the error and call the next automatically so the middleware could handle it
