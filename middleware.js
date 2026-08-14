const Note = require("./models/notes");
const ExpressError = require("./utils/ExpressError");
const { notesSchema } = require("./Schema");

// Is User LoggedIn
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be LoggedIn To create a Note");
    return res.redirect("/login");
  }
  next();
};

// Save The session details before getting reset the session
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Authorization middleware
module.exports.isAuthor = async (req, res, next) => {
  let { id } = req.params;
  let note = await Note.findById(id);
  if (!note.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are Not the Author of this Note");
    return res.redirect(`/notes/${id}`);
  }
  next();
};

// Validation of Note
module.exports.validateNotes = async (req, res, next) => {
  const { error } = notesSchema.validate(req.body);
  // from the result we extract the error
  if (error) {
    throw new ExpressError(400, error.message);
  } else {
    next();
  }
};
