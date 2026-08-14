const Note = require("../models/notes");

module.exports.index = async (req, res) => {
  const notes = await Note.find({ author: req.user._id });
  res.render("notes/index", { notes, query: undefined });
};

module.exports.renderNewForm = (req, res) => {
  res.render("notes/new.ejs");
};

module.exports.showNote = async (req, res) => {
  let { id } = req.params;
  let note = await Note.findById(id).populate("author");
  if (!note) {
    req.flash("error", "The Note You Request For Does Not Exist!");
    return res.redirect("/notes");
  }
  res.render("notes/show.ejs", { note });
};

module.exports.createNote = async (req, res, next) => {
  let note = req.body.Notes;
  note.created_at = new Date();
  const newNote = new Note(note);
  newNote.author = req.user._id;
  await newNote.save();
  req.flash("success", `"${newNote.title}" was created successfully!`);
  res.redirect("/notes");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let note = await Note.findById(id);
  if (!note) {
    req.flash("error", "The Note You Request For Does Not Exist!");
    return res.redirect("/notes");
  }
  res.render("notes/edit.ejs", { note });
};

module.exports.updateNote = async (req, res) => {
  let { id } = req.params;
  await Note.findByIdAndUpdate(id, { ...req.body.Notes });
  req.flash("success", `Your note has been updated `);
  res.redirect(`/notes/${id}`);
};

module.exports.deleteNote = async (req, res) => {
  let { id } = req.params;
  await Note.findByIdAndDelete(id);
  req.flash("success", "Your note has been deleted ");
  res.redirect("/notes");
};

module.exports.searchNotes = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === "") {
    req.flash("error", "Please enter something to search");
    return res.redirect("/notes");
  }
  const notes = await Note.find({
    author: req.user._id,
    title: { $regex: q, $options: "i" },
  });
  res.render("notes/index", { notes, query: q });
};
