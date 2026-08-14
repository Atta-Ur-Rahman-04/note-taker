if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const notes = require("./routes/notes");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");

// const dns = require("dns");
// dns.setServers(["1.1.1.1", "8.8.8.8"]);

const dbUrl = process.env.ATLAS_DB_URL;
// connection with DB --->
main()
  .then(() => {
    console.log("connected to DB successfully!");

    app.listen(8080, () => {
      console.log("app is listening on port 8080");
    });
  })
  .catch((err) => {
    console.log("Database connection error: ", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// store mongo-session-store -->
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  // we want that if we didnot interct with the server then we want to update our session relatedinfo after 24 hour so for that we use touchAfter
  touchAfter: 24 * 3600,
});
// And when we are creating the Express-session then inside thair options we will also include the mongoStore info
store.on("error", (err) => {
  console.log("Error in MongoSession Store", err);
});

const sessionOptions = {
  store: store,
  // now Our session data will store in our cloud DB cause we pass our cloud DB url in url option
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 14 * 24 * 60 * 60 * 1000,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const userRoutes = require("./routes/user");

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// using flash in middleware --->
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
});

// landing page --->
app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  res.render("Home");
});

// using the router path ---->
app.use("/", userRoutes);
app.use("/notes", notes);

// page not found error
app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

// error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong!" } = err;
  res.status(statusCode).render("error", { message });
});
