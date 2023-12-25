import NoteContext from "./noteContext";
import { useState } from "react";

const NoteState= (props)=>{
  const host="http://localhost:5000"
    const notesInitial = [ ]
          const [notes, setNotes] = useState(notesInitial)

          //get all notes 
          const getNotes=async ()=>{
            //API CALL
            const response = await fetch(`${host}/api/note/fetchallnotes`, {
              method: "GET", 
              headers: {
                "Content-Type": "application/json",
                "auth-token" : localStorage.getItem('token')
              },
            });
            const json=await response.json()
            setNotes(json)
          }


          //Add a note 
          const addNote=async (title, description, tag)=>{
            //TODO:API CALL
            const response = await fetch(`${host}/api/note/addnote`, {
              method: "POST", // *GET, POST, PUT, DELETE, etc.
              headers: {
                "Content-Type": "application/json",
                "auth-token" : localStorage.getItem('token')
              },
              body: JSON.stringify({title, description, tag}), 
            });
            const note=await response.json();
            setNotes(notes.concat(note))
          }

          //Delete a note
          const deleteNote=async (id)=>{
              //API call
              const response = await fetch(`${host}/api/note/deletenote/${id}`, {
                method: "DELETE", 
                headers: {
                  "Content-Type": "application/json",
                  "auth-token" : localStorage.getItem('token')
                },
              });
              const json= response.json();
              console.log(json)
            const newNotes=notes.filter((note)=>{return note._id!==id})
            setNotes(newNotes); 
          }

          //Edit a note 
          const editNote=async(id, title, description, tag)=>{
            //API call
            const response = await fetch(`${host}/api/note/updatenote/${id}`, {
              method: "PUT", // *GET, POST, PUT, DELETE, etc.
              headers: {
                "Content-Type": "application/json",
                "auth-token" : localStorage.getItem('token')
              },
              body: JSON.stringify({title, description, tag}) 
            });
            const json= await response.json();
            console.log(json)

           //above note make the deep copy of the note which will be used to show updates of note.
           let newNotes=JSON.parse(JSON.stringify(notes))
            //Logic to edit in client
            for (let index = 0; index < newNotes.length; index++) {
              const element = newNotes[index];
              if(element._id === id)
              {
                newNotes[index].title=title;
                newNotes[index].description=description;
                newNotes[index].tag=tag;
                break;
              }
            }  
              setNotes(newNotes); 
          }

    return(
        <NoteContext.Provider value={{notes, addNote, deleteNote, editNote ,getNotes}}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteState;