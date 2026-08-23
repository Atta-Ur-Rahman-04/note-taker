const express = require("express");
const router = express.Router();
const Note = require("../models/notes");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAuthor, validateNotes } = require("../middleware");
const noteController = require("../controllers/notes");

// Implementing the Router.route to compact the routes , here we have just to define our route once and then we can accpet the get,post etc request on the same defined route --->

// index route ,create route --->
router
  .route("/")
  .get(isLoggedIn, wrapAsync(noteController.index))
  .post(isLoggedIn, validateNotes, wrapAsync(noteController.createNote));

// new route --->
router.get("/new", isLoggedIn, noteController.renderNewForm);

// search Route --->
router.get("/search", isLoggedIn, wrapAsync(noteController.searchNotes));

// show route , delete route , update route --->
router
  .route("/:id")
  .get(isLoggedIn, wrapAsync(noteController.showNote))
  .delete(isLoggedIn, isAuthor, wrapAsync(noteController.deleteNote))
  .put(
    isLoggedIn,
    isAuthor,
    validateNotes,
    wrapAsync(noteController.updateNote),
  );

// Edit form --->
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  wrapAsync(noteController.renderEditForm),
);

module.exports = router;
