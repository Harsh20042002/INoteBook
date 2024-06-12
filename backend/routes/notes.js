const express = require("express"); 
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// get all the notes : Login req.
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error!");
  }
});

// add a new note using post : Login req.
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description should be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      // if validation error, return
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, tag } = req.body;
      const note = await Note.create({ title, description, tag, user: req.user.id });
      // const savedNote = await note.save();
      // res.json(savedNote);
      res.json(note);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error!");
    }
  }
);

// // update an existing note: Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) { 
      newNote.tag = tag;
    }
    // find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    // if the note we are trying to edit doesn't exists
    if (!note) {
      return res.status(404).send("Not Found");
    }
    // if the note we are trying to edit doesn't corresponds to this user
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error!");
  }
});

// // delete an existing note : Login req.
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // find the note to be deleted
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    // allow deletion only if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Alllowed");
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: `Note has been deleted`, note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error!");
  }
});

module.exports = router; 
