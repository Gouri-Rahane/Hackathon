// =============================================
// Music Database - CRUD App
// Express + MongoDB (with Array fallback)
// =============================================

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let useDB = false;

// -----------------------------------------------
// In-memory array fallback
// -----------------------------------------------
let songsArray = [
  { Songname: "Tum Hi Ho",     Film: "Aashiqui 2",         Music_director: "Mithoon",            Singer: "Arijit Singh", Actor: "",       Actress: "" },
  { Songname: "Channa Mereya", Film: "Ae Dil Hai Mushkil", Music_director: "Pritam",             Singer: "Arijit Singh", Actor: "Ranbir", Actress: "Anushka" },
  { Songname: "Kal Ho Naa Ho", Film: "Kal Ho Naa Ho",      Music_director: "Shankar Ehsaan Loy", Singer: "Sonu Nigam",   Actor: "SRK",    Actress: "Preity" },
  { Songname: "Raabta",        Film: "Agent Sai Srinivas", Music_director: "Pritam",             Singer: "Arijit Singh", Actor: "",       Actress: "" },
  { Songname: "Kesariya",      Film: "Brahmastra",         Music_director: "Pritam",             Singer: "Arijit Singh", Actor: "Ranbir", Actress: "Alia" }
];

// -----------------------------------------------
// Mongoose Schema and Model
// -----------------------------------------------
const songSchema = new mongoose.Schema({
  Songname:       String,
  Film:           String,
  Music_director: String,
  Singer:         String,
  Actor:          { type: String, default: "" },
  Actress:        { type: String, default: "" }
});

const Song = mongoose.model("songdetails", songSchema);

// -----------------------------------------------
// Connect to Local MongoDB
// -----------------------------------------------
mongoose.connect("mongodb://127.0.0.1:27017/music", {
  serverSelectionTimeoutMS: 3000
})
.then(async () => {
  console.log("Connected to MongoDB");
  useDB = true;
  const count = await Song.countDocuments();
  if (count === 0) {
    await Song.insertMany(songsArray);
    console.log("Sample songs inserted into MongoDB");
  }
})
.catch((err) => {
  console.log("MongoDB not available. Using in-memory array instead.");
  useDB = false;
});

// -----------------------------------------------
// CSS Styles
// -----------------------------------------------
const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #0f0c29;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    min-height: 100vh;
    color: #fff;
  }

  /* ---- Navbar ---- */
  .navbar {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(10px);
    padding: 15px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .navbar .logo {
    font-size: 22px;
    font-weight: 700;
    color: #a78bfa;
    letter-spacing: 1px;
  }
  .navbar .logo span { color: #fff; }
  .nav-links a {
    color: #ccc;
    text-decoration: none;
    margin-left: 25px;
    font-size: 14px;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: #a78bfa; }

  /* ---- Page Wrapper ---- */
  .container {
    max-width: 1100px;
    margin: 40px auto;
    padding: 0 20px;
  }

  /* ---- Page Title ---- */
  .page-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 25px;
    color: #e2d9f3;
    border-left: 4px solid #a78bfa;
    padding-left: 14px;
  }

  /* ---- Mode Badge ---- */
  .badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .badge.mongo  { background: #16a34a; color: #fff; }
  .badge.array  { background: #d97706; color: #fff; }

  /* ---- Stats Cards (Home) ---- */
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 35px;
  }
  .card {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    padding: 24px 20px;
    text-align: center;
    transition: transform 0.2s, background 0.2s;
  }
  .card:hover { transform: translateY(-4px); background: rgba(167,139,250,0.15); }
  .card .icon { font-size: 32px; margin-bottom: 10px; }
  .card .label { font-size: 13px; color: #aaa; margin-bottom: 6px; }
  .card .value { font-size: 22px; font-weight: 700; color: #a78bfa; }
  .card a { text-decoration: none; color: inherit; }

  /* ---- Quick Links ---- */
  .quick-links { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 30px; }
  .btn {
    display: inline-block;
    padding: 10px 22px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s, transform 0.1s;
  }
  .btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-primary  { background: #7c3aed; color: #fff; }
  .btn-success  { background: #16a34a; color: #fff; }
  .btn-danger   { background: #dc2626; color: #fff; }
  .btn-warning  { background: #d97706; color: #fff; }
  .btn-info     { background: #0891b2; color: #fff; }
  .btn-secondary{ background: rgba(255,255,255,0.12); color: #fff; }

  /* ---- Table ---- */
  .table-wrap {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 25px;
  }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: rgba(124,58,237,0.5); }
  thead th {
    padding: 14px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #e2d9f3;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  tbody tr { border-top: 1px solid rgba(255,255,255,0.07); transition: background 0.15s; }
  tbody tr:hover { background: rgba(167,139,250,0.1); }
  tbody td { padding: 13px 16px; font-size: 14px; color: #ddd; }
  .action-btns { display: flex; gap: 8px; }
  .action-btns a {
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .action-btns a:hover { opacity: 0.8; }
  .btn-edit   { background: #d97706; color: #fff; }
  .btn-delete { background: #dc2626; color: #fff; }

  /* ---- Empty State ---- */
  .empty {
    text-align: center;
    padding: 50px 20px;
    color: #888;
    font-size: 15px;
  }
  .empty .empty-icon { font-size: 48px; margin-bottom: 12px; }

  /* ---- Form Card ---- */
  .form-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 35px 40px;
    max-width: 560px;
  }
  .form-group { margin-bottom: 20px; }
  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #c4b5fd;
    margin-bottom: 7px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .form-group input {
    width: 100%;
    padding: 11px 15px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .form-group input:focus { border-color: #7c3aed; background: rgba(124,58,237,0.1); }
  .form-group input::placeholder { color: #666; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* ---- Alert Messages ---- */
  .alert {
    padding: 14px 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: 500;
  }
  .alert-success { background: rgba(22,163,74,0.2);  border: 1px solid #16a34a; color: #86efac; }
  .alert-error   { background: rgba(220,38,38,0.2);  border: 1px solid #dc2626; color: #fca5a5; }
  .alert-info    { background: rgba(8,145,178,0.2);  border: 1px solid #0891b2; color: #7dd3fc; }

  /* ---- Footer ---- */
  .footer {
    text-align: center;
    padding: 30px;
    color: #555;
    font-size: 13px;
    margin-top: 40px;
  }
`;

// -----------------------------------------------
// Helper: Full HTML page wrapper
// -----------------------------------------------
function page(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} | MusicDB</title>
  <style>${CSS}</style>
</head>
<body>

  <nav class="navbar">
    <div class="logo">🎵 <span>Music</span>DB</div>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/songs">All Songs</a>
      <a href="/count">Count</a>
      <a href="/add">Add Song</a>
    </div>
  </nav>

  <div class="container">
    ${body}
  </div>

  <div class="footer">Music Database App &mdash; Express + MongoDB</div>

</body>
</html>`;
}

// -----------------------------------------------
// Helper: Build HTML table from songs array
// -----------------------------------------------
function buildTable(songs, showActions = true) {
  if (songs.length === 0) {
    return `<div class="empty">
      <div class="empty-icon">🎵</div>
      <p>No songs found.</p>
    </div>`;
  }

  let rows = "";
  for (let s of songs) {
    rows += `<tr>
      <td><strong>${s.Songname}</strong></td>
      <td>${s.Film}</td>
      <td>${s.Music_director}</td>
      <td>${s.Singer}</td>
      <td>${s.Actor  || "<span style='color:#555'>—</span>"}</td>
      <td>${s.Actress|| "<span style='color:#555'>—</span>"}</td>
      ${showActions ? `<td>
        <div class="action-btns">
          <a href="/update/${encodeURIComponent(s.Songname)}" class="btn-edit">Edit</a>
          <a href="/delete/${encodeURIComponent(s.Songname)}" class="btn-delete"
             onclick="return confirm('Delete ${s.Songname}?')">Delete</a>
        </div>
      </td>` : ""}
    </tr>`;
  }

  return `<div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Song Name</th>
          <th>Film</th>
          <th>Music Director</th>
          <th>Singer</th>
          <th>Actor</th>
          <th>Actress</th>
          ${showActions ? "<th>Actions</th>" : ""}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ===============================================
// ROUTES
// ===============================================

// --- Home ---
app.get("/", async (req, res) => {
  let total = useDB ? await Song.countDocuments() : songsArray.length;
  const mode = useDB ? "MongoDB" : "In-Memory Array";
  const badgeClass = useDB ? "mongo" : "array";

  const body = `
    <div class="page-title">Dashboard</div>
    <span class="badge ${badgeClass}">Mode: ${mode}</span>

    <div class="cards">
      <div class="card">
        <a href="/songs">
          <div class="icon">🎵</div>
          <div class="label">Total Songs</div>
          <div class="value">${total}</div>
        </a>
      </div>
      <div class="card">
        <a href="/songs/director/Pritam">
          <div class="icon">🎼</div>
          <div class="label">By Director</div>
          <div class="value">Filter</div>
        </a>
      </div>
      <div class="card">
        <a href="/songs/filter?director=Pritam&singer=Arijit Singh">
          <div class="icon">🎤</div>
          <div class="label">By Singer</div>
          <div class="value">Filter</div>
        </a>
      </div>
      <div class="card">
        <a href="/add">
          <div class="icon">➕</div>
          <div class="label">Add Song</div>
          <div class="value">New</div>
        </a>
      </div>
    </div>

    <div class="page-title" style="font-size:18px;">Quick Links</div>
    <div class="quick-links">
      <a href="/songs"                                                    class="btn btn-primary">All Songs</a>
      <a href="/count"                                                    class="btn btn-info">Song Count</a>
      <a href="/songs/director/Pritam"                                    class="btn btn-secondary">Director: Pritam</a>
      <a href="/songs/director/Mithoon"                                   class="btn btn-secondary">Director: Mithoon</a>
      <a href="/songs/filter?director=Pritam&singer=Arijit Singh"         class="btn btn-secondary">Pritam + Arijit</a>
      <a href="/songs/film?film=Brahmastra&singer=Arijit Singh"           class="btn btn-secondary">Brahmastra Songs</a>
      <a href="/add"                                                       class="btn btn-success">+ Add Song</a>
    </div>`;

  res.send(page("Home", body));
});

// -----------------------------------------------
// a) Count
// -----------------------------------------------
app.get("/count", async (req, res) => {
  let total = useDB ? await Song.countDocuments() : songsArray.length;

  const body = `
    <div class="page-title">Song Count</div>
    <div class="alert alert-info" style="font-size:18px;">
      🎵 Total songs in the database: <strong>${total}</strong>
    </div>
    <a href="/" class="btn btn-secondary">← Back to Home</a>
    <a href="/songs" class="btn btn-primary" style="margin-left:10px;">View All Songs</a>`;

  res.send(page("Count", body));
});

// -----------------------------------------------
// b) All Songs
// -----------------------------------------------
app.get("/songs", async (req, res) => {
  let songs = useDB
    ? await Song.find({}, { _id: 0, __v: 0 })
    : songsArray;

  const body = `
    <div class="page-title">All Songs</div>
    ${buildTable(songs)}
    <a href="/" class="btn btn-secondary">← Back to Home</a>
    <a href="/add" class="btn btn-success" style="margin-left:10px;">+ Add Song</a>`;

  res.send(page("All Songs", body));
});

// -----------------------------------------------
// c) Songs by Director
// -----------------------------------------------
app.get("/songs/director/:name", async (req, res) => {
  const name = req.params.name;
  let songs = useDB
    ? await Song.find({ Music_director: name }, { _id: 0, __v: 0 })
    : songsArray.filter(s => s.Music_director === name);

  const body = `
    <div class="page-title">Songs by Director: ${name}</div>
    ${buildTable(songs)}
    <a href="/" class="btn btn-secondary">← Back to Home</a>`;

  res.send(page(`Director: ${name}`, body));
});

// -----------------------------------------------
// d) Filter by Director + Singer
// -----------------------------------------------
app.get("/songs/filter", async (req, res) => {
  const director = req.query.director;
  const singer   = req.query.singer;

  if (!director || !singer) {
    const body = `
      <div class="page-title">Filter Songs</div>
      <div class="alert alert-error">Please provide both <strong>director</strong> and <strong>singer</strong> query params.<br>
        Example: <code>/songs/filter?director=Pritam&amp;singer=Arijit Singh</code>
      </div>
      <a href="/" class="btn btn-secondary">← Back to Home</a>`;
    return res.send(page("Filter", body));
  }

  let songs = useDB
    ? await Song.find({ Music_director: director, Singer: singer }, { _id: 0, __v: 0 })
    : songsArray.filter(s => s.Music_director === director && s.Singer === singer);

  const body = `
    <div class="page-title">Director: ${director} &amp; Singer: ${singer}</div>
    ${buildTable(songs)}
    <a href="/" class="btn btn-secondary">← Back to Home</a>`;

  res.send(page("Filter", body));
});

// -----------------------------------------------
// e) Delete a song
// -----------------------------------------------
app.get("/delete/:songname", async (req, res) => {
  const name = req.params.songname;
  let success = false;

  if (useDB) {
    const result = await Song.deleteOne({ Songname: name });
    success = result.deletedCount > 0;
  } else {
    const index = songsArray.findIndex(s => s.Songname === name);
    if (index !== -1) { songsArray.splice(index, 1); success = true; }
  }

  const body = `
    <div class="page-title">Delete Song</div>
    <div class="alert ${success ? "alert-success" : "alert-error"}">
      ${success
        ? `✅ Song "<strong>${name}</strong>" has been deleted successfully.`
        : `❌ Song "<strong>${name}</strong>" was not found.`}
    </div>
    <a href="/songs" class="btn btn-primary">View All Songs</a>
    <a href="/" class="btn btn-secondary" style="margin-left:10px;">← Home</a>`;

  res.send(page("Delete", body));
});

// -----------------------------------------------
// f) Add Song - GET (form) + POST (save)
// -----------------------------------------------
app.get("/add", (req, res) => {
  const body = `
    <div class="page-title">Add New Song</div>
    <div class="form-card">
      <form method="POST" action="/add">
        <div class="form-group">
          <label>Song Name *</label>
          <input type="text" name="Songname" placeholder="e.g. Tum Hi Ho" required />
        </div>
        <div class="form-group">
          <label>Film *</label>
          <input type="text" name="Film" placeholder="e.g. Aashiqui 2" required />
        </div>
        <div class="form-group">
          <label>Music Director *</label>
          <input type="text" name="Music_director" placeholder="e.g. Pritam" required />
        </div>
        <div class="form-group">
          <label>Singer *</label>
          <input type="text" name="Singer" placeholder="e.g. Arijit Singh" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Actor</label>
            <input type="text" name="Actor" placeholder="Optional" />
          </div>
          <div class="form-group">
            <label>Actress</label>
            <input type="text" name="Actress" placeholder="Optional" />
          </div>
        </div>
        <button type="submit" class="btn btn-success" style="width:100%; padding:13px; font-size:15px;">
          ➕ Add Song
        </button>
      </form>
    </div>
    <br>
    <a href="/" class="btn btn-secondary">← Back to Home</a>`;

  res.send(page("Add Song", body));
});

app.post("/add", async (req, res) => {
  const newSong = {
    Songname:       req.body.Songname,
    Film:           req.body.Film,
    Music_director: req.body.Music_director,
    Singer:         req.body.Singer,
    Actor:          req.body.Actor   || "",
    Actress:        req.body.Actress || ""
  };

  if (useDB) {
    await Song.create(newSong);
  } else {
    songsArray.push(newSong);
  }

  const body = `
    <div class="page-title">Song Added</div>
    <div class="alert alert-success">
      ✅ Song "<strong>${newSong.Songname}</strong>" has been added successfully!
    </div>
    <a href="/songs" class="btn btn-primary">View All Songs</a>
    <a href="/add"   class="btn btn-success" style="margin-left:10px;">+ Add Another</a>
    <a href="/"      class="btn btn-secondary" style="margin-left:10px;">← Home</a>`;

  res.send(page("Song Added", body));
});

// -----------------------------------------------
// g) Songs by Film + Singer
// -----------------------------------------------
app.get("/songs/film", async (req, res) => {
  const film   = req.query.film;
  const singer = req.query.singer;

  if (!film || !singer) {
    const body = `
      <div class="page-title">Filter by Film + Singer</div>
      <div class="alert alert-error">Please provide both <strong>film</strong> and <strong>singer</strong> query params.<br>
        Example: <code>/songs/film?film=Brahmastra&amp;singer=Arijit Singh</code>
      </div>
      <a href="/" class="btn btn-secondary">← Back to Home</a>`;
    return res.send(page("Filter", body));
  }

  let songs = useDB
    ? await Song.find({ Film: film, Singer: singer }, { _id: 0, __v: 0 })
    : songsArray.filter(s => s.Film === film && s.Singer === singer);

  const body = `
    <div class="page-title">Film: ${film} &amp; Singer: ${singer}</div>
    ${buildTable(songs)}
    <a href="/" class="btn btn-secondary">← Back to Home</a>`;

  res.send(page("Film Filter", body));
});

// -----------------------------------------------
// h) Update Song - GET (form) + POST (save)
// -----------------------------------------------
app.get("/update/:songname", (req, res) => {
  const name = req.params.songname;

  const body = `
    <div class="page-title">Update Song: ${name}</div>
    <div class="form-card">
      <p style="color:#aaa; margin-bottom:20px; font-size:14px;">
        Add Actor and Actress details for this song.
      </p>
      <form method="POST" action="/update/${encodeURIComponent(name)}">
        <div class="form-row">
          <div class="form-group">
            <label>Actor *</label>
            <input type="text" name="Actor" placeholder="e.g. Ranbir Kapoor" required />
          </div>
          <div class="form-group">
            <label>Actress *</label>
            <input type="text" name="Actress" placeholder="e.g. Alia Bhatt" required />
          </div>
        </div>
        <button type="submit" class="btn btn-warning" style="width:100%; padding:13px; font-size:15px;">
          ✏️ Update Song
        </button>
      </form>
    </div>
    <br>
    <a href="/songs" class="btn btn-secondary">← Back to Songs</a>`;

  res.send(page("Update Song", body));
});

app.post("/update/:songname", async (req, res) => {
  const name    = req.params.songname;
  const actor   = req.body.Actor;
  const actress = req.body.Actress;
  let success   = false;

  if (useDB) {
    const result = await Song.updateOne(
      { Songname: name },
      { $set: { Actor: actor, Actress: actress } }
    );
    success = result.matchedCount > 0;
  } else {
    const song = songsArray.find(s => s.Songname === name);
    if (song) { song.Actor = actor; song.Actress = actress; success = true; }
  }

  const body = `
    <div class="page-title">Update Song</div>
    <div class="alert ${success ? "alert-success" : "alert-error"}">
      ${success
        ? `✅ "<strong>${name}</strong>" updated — Actor: ${actor}, Actress: ${actress}`
        : `❌ Song "<strong>${name}</strong>" was not found.`}
    </div>
    <a href="/songs" class="btn btn-primary">View All Songs</a>
    <a href="/"      class="btn btn-secondary" style="margin-left:10px;">← Home</a>`;

  res.send(page("Updated", body));
});

// -----------------------------------------------
// Start Server
// -----------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
