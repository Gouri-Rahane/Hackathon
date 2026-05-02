// server.js - Main file for Online Bookstore App
// Student Project - CRUD Application using Node.js, Express, MongoDB

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS) from public folder
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// DATABASE SETUP - MongoDB with fallback array
// =============================================

let useMongo = false;
let Book = null;

// In-memory array used as fallback if MongoDB is not available
let booksArray = [
    { title: 'The Alchemist', author: 'Paulo Coelho', price: 299, genre: 'Fiction' },
    { title: 'Clean Code', author: 'Robert C. Martin', price: 599, genre: 'Technology' }
];

// Try to connect to local MongoDB
try {
    const mongoose = require('mongoose');

    // Book schema definition
    const bookSchema = new mongoose.Schema({
        title: String,
        author: String,
        price: Number,
        genre: String
    });

    Book = mongoose.model('Book', bookSchema);

    // Connect to local MongoDB
    mongoose.connect('mongodb://127.0.0.1:27017/bookstore')
        .then(() => {
            console.log('Connected to MongoDB successfully!');
            useMongo = true;
        })
        .catch((err) => {
            console.log('MongoDB not available. Using in-memory array as fallback.');
            console.log('Error:', err.message);
            useMongo = false;
        });

} catch (err) {
    console.log('Mongoose not installed. Using in-memory array as fallback.');
    useMongo = false;
}

// =============================================
// ROUTES
// =============================================

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Add book page
app.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'add.html'));
});

// View books page - fetches all books and shows in table
app.get('/books', (req, res) => {
    if (useMongo && Book) {
        // Get books from MongoDB
        Book.find({})
            .then(books => {
                res.send(buildViewPage(books));
            })
            .catch(err => {
                res.send('<h2>Error fetching books from database.</h2>');
            });
    } else {
        // Use in-memory array
        res.send(buildViewPage(booksArray));
    }
});

// Add a new book - POST /add
app.post('/add', (req, res) => {
    const { title, author, price, genre } = req.body;

    // Basic validation
    if (!title || !author || !price || !genre) {
        return res.send('<h2 style="color:red; text-align:center;">All fields are required! <a href="/add">Go Back</a></h2>');
    }

    if (useMongo && Book) {
        // Save to MongoDB
        const newBook = new Book({ title, author, price: parseFloat(price), genre });
        newBook.save()
            .then(() => {
                res.redirect('/books');
            })
            .catch(err => {
                res.send('<h2>Error saving book. <a href="/add">Go Back</a></h2>');
            });
    } else {
        // Save to in-memory array
        booksArray.push({ title, author, price: parseFloat(price), genre });
        res.redirect('/books');
    }
});

// Delete a book by title - GET /delete/:title
app.get('/delete/:title', (req, res) => {
    const bookTitle = decodeURIComponent(req.params.title);

    if (useMongo && Book) {
        Book.deleteOne({ title: bookTitle })
            .then(() => {
                res.redirect('/books');
            })
            .catch(err => {
                res.send('<h2>Error deleting book. <a href="/books">Go Back</a></h2>');
            });
    } else {
        // Remove from in-memory array
        booksArray = booksArray.filter(b => b.title !== bookTitle);
        res.redirect('/books');
    }
});

// Update book page - show form with existing data
app.get('/update/:title', (req, res) => {
    const bookTitle = decodeURIComponent(req.params.title);

    if (useMongo && Book) {
        Book.findOne({ title: bookTitle })
            .then(book => {
                if (!book) {
                    return res.send('<h2>Book not found. <a href="/books">Go Back</a></h2>');
                }
                res.send(buildUpdatePage(book));
            })
            .catch(err => {
                res.send('<h2>Error finding book. <a href="/books">Go Back</a></h2>');
            });
    } else {
        const book = booksArray.find(b => b.title === bookTitle);
        if (!book) {
            return res.send('<h2>Book not found. <a href="/books">Go Back</a></h2>');
        }
        res.send(buildUpdatePage(book));
    }
});

// Update book - POST /update/:title
app.post('/update/:title', (req, res) => {
    const bookTitle = decodeURIComponent(req.params.title);
    const { author, price, genre } = req.body;

    if (useMongo && Book) {
        Book.updateOne({ title: bookTitle }, { author, price: parseFloat(price), genre }, (err) => {
            if (err) {
                return res.send('<h2>Error updating book. <a href="/books">Go Back</a></h2>');
            }
            res.redirect('/books');
        });
    } else {
        // Update in in-memory array
        const book = booksArray.find(b => b.title === bookTitle);
        if (book) {
            book.author = author;
            book.price = parseFloat(price);
            book.genre = genre;
        }
        res.redirect('/books');
    }
});

// =============================================
// HTML BUILDER FUNCTIONS
// =============================================

// Build the View Books page dynamically with table
function buildViewPage(books) {
    let rows = '';

    if (books.length === 0) {
        rows = '<tr><td colspan="5" style="text-align:center;">No books found. Add some books!</td></tr>';
    } else {
        books.forEach(book => {
            const encodedTitle = encodeURIComponent(book.title);
            rows += `
            <tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>Rs. ${book.price}</td>
                <td>${book.genre}</td>
                <td>
                    <a href="/update/${encodedTitle}" class="btn btn-update">Update</a>
                    <a href="/delete/${encodedTitle}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this book?')">Delete</a>
                </td>
            </tr>`;
        });
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>View Books - Online Bookstore</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <div class="navbar">
            <h2>📚 Online Bookstore</h2>
            <div class="nav-links">
                <a href="/">Home</a>
                <a href="/add">Add Book</a>
                <a href="/books">View Books</a>
            </div>
        </div>

        <div class="container">
            <h2>All Books</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Price</th>
                        <th>Genre</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            <br>
            <a href="/add" class="btn btn-update">+ Add New Book</a>
        </div>
    </body>
    </html>`;
}

// Build the Update Book page with pre-filled form
function buildUpdatePage(book) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Update Book - Online Bookstore</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <div class="navbar">
            <h2>📚 Online Bookstore</h2>
            <div class="nav-links">
                <a href="/">Home</a>
                <a href="/add">Add Book</a>
                <a href="/books">View Books</a>
            </div>
        </div>

        <div class="container">
            <h2>Update Book</h2>
            <form action="/update/${encodeURIComponent(book.title)}" method="POST">
                <div class="form-group">
                    <label>Title (cannot be changed):</label>
                    <input type="text" value="${book.title}" disabled>
                </div>
                <div class="form-group">
                    <label>Author:</label>
                    <input type="text" name="author" value="${book.author}" required>
                </div>
                <div class="form-group">
                    <label>Price (Rs.):</label>
                    <input type="number" name="price" value="${book.price}" required>
                </div>
                <div class="form-group">
                    <label>Genre:</label>
                    <input type="text" name="genre" value="${book.genre}" required>
                </div>
                <button type="submit" class="btn btn-update">Update Book</button>
                <a href="/books" class="btn btn-delete">Cancel</a>
            </form>
        </div>
    </body>
    </html>`;
}

// =============================================
// START SERVER
// =============================================
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log('Open your browser and go to http://localhost:3000');
});
