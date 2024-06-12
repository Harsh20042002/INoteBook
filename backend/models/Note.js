const mongoose = require('mongoose');

const NotesSchema = new mongoose.Schema({
    // like a foreign key in sql,
    // represents the association of this note to it's respective user
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }, 
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true, 
    }, 
    tag: {
        type: String,
        default: 'General'
    },
    date: {
        type: Date,
        default: Date.now
    },       
});

module.exports = mongoose.model('notes', NotesSchema)