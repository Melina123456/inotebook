const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
var fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

// ROUTE 1:fetch all notes using: GET "/api/note/fetchallnotes".login required.
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const note = await Note.find({ user: req.user.id });
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error:some error occured");
  }
});

// ROUTE 2:Add the new note using: POST "/api/note/addnote".login required.
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter the valid title ").isLength({ min: 3 }),
    body(
      "description",
      "The description must be at least 6 characters."
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    //destructuring concept
    const { title, description, tag } = req.body;
    //If there are errors , return Bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error:some error occured");
    }
  }
);

// ROUTE 3:update the note using: PUT "/api/note/updatenote".login required.
router.put(
  "/updatenote/:id",
  fetchUser,
  async (req, res) => { 
    //destructuring 
    const {title, description, tag}=req.body;
    //Create a newnote object
    try {
    const newNote={};
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    //find the note to be update and update it 
    // const note=Note.findByIdAndUpdate() not doing this because hacker could easily get the data
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}
 
  if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed");
  }
  note =await Note.findByIdAndUpdate(req.params.id,{$set: newNote}, {new:true})
  res.json({newNote})
} catch (error) {
  console.error(error.message);
  res.status(500).send("Internal Server Error:some error occured");
}
})

// ROUTE 3:delete the note using: DELETE "/api/note/deletenote".login required.
router.delete(
  '/deletenote/:id',
  fetchUser,
  async (req, res) => { 
    try {
    //find the note to be deleted and delete it 
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}

 //allow the deletion only if the user owns this note.
  if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed");
  }
  note =await Note.findByIdAndDelete(req.params.id)
  res.json({"success":"The note has been deleted", note:note});
} catch (error) {
  console.error(error.message);
  res.status(500).send("Internal Server Error:some error occured");
}
})

module.exports = router;
