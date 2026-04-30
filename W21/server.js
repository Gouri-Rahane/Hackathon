const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// 🔗 Connect MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bookDB')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 📚 Book Schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    price: Number,
    genre: String
});

// 📦 Model
const Book = mongoose.model('Book', bookSchema);


// ➕ ADD BOOK
app.post('/add', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.send("Book Added Successfully");
    } catch (err) {
        res.send(err);
    }
});


// 📄 GET ALL BOOKS
app.get('/view', async (req, res) => {
    const data = await Book.find();
    res.json(data);
});


// ✏️ UPDATE BOOK
app.put('/update/:id', async (req, res) => {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.send("Book Updated Successfully");
});


// ❌ DELETE BOOK
app.delete('/delete/:id', async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.send("Book Deleted Successfully");
});


// 🚀 START SERVER
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});