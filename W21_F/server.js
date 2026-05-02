const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Database setup ───────────────────────────────────────────────
let useMongo = false, Book = null;
let booksArray = [
    { title: 'The Alchemist', author: 'Paulo Coelho', price: 299, genre: 'Fiction' },
    { title: 'Clean Code', author: 'Robert C. Martin', price: 599, genre: 'Technology' }
];

try {
    const mongoose = require('mongoose');
    Book = mongoose.model('Book', new mongoose.Schema({ title: String, author: String, price: Number, genre: String }));
    mongoose.connect('mongodb://127.0.0.1:27017/bookstore')
        .then(() => { useMongo = true; console.log('MongoDB connected'); })
        .catch(() => console.log('MongoDB unavailable, using in-memory array'));
} catch {
    console.log('Mongoose not installed, using in-memory array');
}

// ── Helpers ──────────────────────────────────────────────────────
const view = (file) => path.join(__dirname, 'views', file);

function render(file, replacements = {}) {
    let html = fs.readFileSync(view(file), 'utf8');
    for (const [key, val] of Object.entries(replacements)) html = html.replaceAll(key, val);
    return html;
}

function buildViewContent(books) {
    const total = books.length;
    const genres = new Set(books.map(b => b.genre)).size;
    const avg = total ? Math.round(books.reduce((s, b) => s + b.price, 0) / total) : 0;

    const content = total === 0
        ? `<div class="empty-state">
               <h3>No Books Found</h3>
               <p>Start by adding your first book.</p>
               <a href="/add" class="btn btn-primary">Add Book</a>
           </div>`
        : `<table>
               <thead><tr>
                   <th>Title</th><th>Author</th><th>Price</th><th>Genre</th><th>Actions</th>
               </tr></thead>
               <tbody>${books.map(b => {
                   const enc = encodeURIComponent(b.title);
                   return `<tr>
                       <td>${b.title}</td>
                       <td>${b.author}</td>
                       <td>₹${b.price}</td>
                       <td>${b.genre}</td>
                       <td>
                           <a href="/update/${enc}" class="btn btn-success" style="padding:5px 12px;font-size:12px">Edit</a>
                           <a href="/delete/${enc}" class="btn btn-danger" style="padding:5px 12px;font-size:12px" onclick="return confirm('Delete this book?')">Delete</a>
                       </td>
                   </tr>`;
               }).join('')}</tbody>
           </table>`;

    return render('view.html', {
        '{{TOTAL}}': total, '{{GENRES}}': genres, '{{AVG_PRICE}}': avg, '{{CONTENT}}': content
    });
}

// ── Routes ───────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(view('index.html')));
app.get('/add', (req, res) => res.sendFile(view('add.html')));

app.get('/books', async (req, res) => {
    const books = useMongo ? await Book.find({}).catch(() => []) : booksArray;
    res.send(buildViewContent(books));
});

app.post('/add', async (req, res) => {
    const { title, author, price, genre } = req.body;
    if (!title || !author || !price || !genre)
        return res.send('<p style="color:#f38ba8;text-align:center;padding:20px">All fields required. <a href="/add" style="color:#89b4fa">Go back</a></p>');
    if (useMongo) await new Book({ title, author, price: +price, genre }).save().catch(() => {});
    else booksArray.push({ title, author, price: +price, genre });
    res.redirect('/books');
});

app.get('/delete/:title', async (req, res) => {
    const title = decodeURIComponent(req.params.title);
    if (useMongo) await Book.deleteOne({ title }).catch(() => {});
    else booksArray = booksArray.filter(b => b.title !== title);
    res.redirect('/books');
});

app.get('/update/:title', async (req, res) => {
    const title = decodeURIComponent(req.params.title);
    const book = useMongo ? await Book.findOne({ title }).catch(() => null) : booksArray.find(b => b.title === title);
    if (!book) return res.send('<p style="color:#f38ba8;text-align:center;padding:20px">Book not found. <a href="/books" style="color:#89b4fa">Go back</a></p>');
    res.send(render('update.html', {
        '{{TITLE_ENC}}': encodeURIComponent(book.title),
        '{{TITLE}}': book.title, '{{AUTHOR}}': book.author,
        '{{PRICE}}': book.price, '{{GENRE}}': book.genre
    }));
});

app.post('/update/:title', async (req, res) => {
    const title = decodeURIComponent(req.params.title);
    const { author, price, genre } = req.body;
    if (useMongo) await Book.updateOne({ title }, { author, price: +price, genre }).catch(() => {});
    else { const b = booksArray.find(b => b.title === title); if (b) Object.assign(b, { author, price: +price, genre }); }
    res.redirect('/books');
});

// ── Start ────────────────────────────────────────────────────────
app.listen(3000, () => console.log('Server running at http://localhost:3000'));
