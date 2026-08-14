const User = require("../models/user");

// SignUp --->
module.exports.renderSignupForm = (req, res, next) => {
  res.render("users/signup");
};
module.exports.signUp = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = User({ email, username });
    const registerdUser = await User.register(newUser, password);
    req.login(registerdUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to NoteTaker");
      res.redirect("/notes");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// logIn --->
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to NoteTaker");
  let redirectUrl = res.locals.redirectUrl || "/notes";
  res.redirect(redirectUrl);
};
// actual work was done by the passport so we have not to say this login cause it just handling the successfull login but for simplicity we just say it login

// Logout --->
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out!");
    res.redirect("/");
  });
};
