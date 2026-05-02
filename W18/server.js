const express  = require("express");
const mongoose = require("mongoose");
const path     = require("path");
const { page, buildTable } = require("./views");

const app  = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------------------------
// In-memory fallback data
// -----------------------------------------------
let useDB = false;
let songsArray = [
  { Songname: "Tum Hi Ho",      Film: "Aashiqui 2",         Music_director: "Mithoon",            Singer: "Arijit Singh", Actor: "",       Actress: "" },
  { Songname: "Channa Mereya",  Film: "Ae Dil Hai Mushkil", Music_director: "Pritam",             Singer: "Arijit Singh", Actor: "Ranbir", Actress: "Anushka" },
  { Songname: "Kal Ho Naa Ho",  Film: "Kal Ho Naa Ho",      Music_director: "Shankar Ehsaan Loy", Singer: "Sonu Nigam",   Actor: "SRK",    Actress: "Preity" },
  { Songname: "Raabta",         Film: "Agent Sai Srinivas", Music_director: "Pritam",             Singer: "Arijit Singh", Actor: "",       Actress: "" },
  { Songname: "Kesariya",       Film: "Brahmastra",         Music_director: "Pritam",             Singer: "Arijit Singh", Actor: "Ranbir", Actress: "Alia" }
];

// -----------------------------------------------
// Mongoose model
// -----------------------------------------------
const Song = mongoose.model("songdetails", new mongoose.Schema({
  Songname: String, Film: String, Music_director: String,
  Singer: String,
  Actor:   { type: String, default: "" },
  Actress: { type: String, default: "" }
}));

// -----------------------------------------------
// DB helpers
// -----------------------------------------------
async function getSongs(filter = {}) {
  return useDB ? Song.find(filter, { _id: 0, __v: 0 }) : songsArray.filter(s =>
    Object.entries(filter).every(([k, v]) => s[k] === v)
  );
}

async function getCount() {
  return useDB ? Song.countDocuments() : songsArray.length;
}

// -----------------------------------------------
// Connect to MongoDB (falls back to array)
// -----------------------------------------------
mongoose.connect("mongodb://127.0.0.1:27017/music", { serverSelectionTimeoutMS: 3000 })
  .then(async () => {
    useDB = true;
    console.log("Connected to MongoDB");
    if (await Song.countDocuments() === 0) {
      await Song.insertMany(songsArray);
      console.log("Sample songs inserted");
    }
  })
  .catch(() => console.log("MongoDB unavailable — using in-memory array"));

// ===============================================
// ROUTES
// ===============================================

// Home
app.get("/", async (req, res) => {
  const total = await getCount();
  res.send(page("Home", `
    <div class="page-title">Dashboard</div>
    <span class="badge ${useDB ? "mongo" : "array"}">Mode: ${useDB ? "MongoDB" : "In-Memory Array"}</span>
    <div class="cards">
      <div class="card"><a href="/songs"><div class="label">Total Songs</div><div class="value">${total}</div></a></div>
      <div class="card"><a href="/songs/director/Pritam"><div class="label">By Director</div><div class="value">Filter</div></a></div>
      <div class="card"><a href="/songs/filter?director=Pritam&singer=Arijit Singh"><div class="label">By Singer</div><div class="value">Filter</div></a></div>
      <div class="card"><a href="/add"><div class="label">Add Song</div><div class="value">New</div></a></div>
    </div>
    <div class="page-title" style="font-size:18px;">Quick Links</div>
    <div class="quick-links">
      <a href="/songs" class="btn btn-primary">All Songs</a>
      <a href="/count" class="btn btn-info">Song Count</a>
      <a href="/songs/director/Pritam" class="btn btn-secondary">Director: Pritam</a>
      <a href="/songs/director/Mithoon" class="btn btn-secondary">Director: Mithoon</a>
      <a href="/songs/filter?director=Pritam&singer=Arijit Singh" class="btn btn-secondary">Pritam + Arijit</a>
      <a href="/songs/film?film=Brahmastra&singer=Arijit Singh" class="btn btn-secondary">Brahmastra Songs</a>
      <a href="/add" class="btn btn-success">+ Add Song</a>
    </div>`));
});

// Count
app.get("/count", async (req, res) => {
  const total = await getCount();
  res.send(page("Count", `
    <div class="page-title">Song Count</div>
    <div class="alert alert-info" style="font-size:18px;">Total songs: <strong>${total}</strong></div>
    <a href="/" class="btn btn-secondary">← Back</a>
    <a href="/songs" class="btn btn-primary" style="margin-left:10px;">View All Songs</a>`));
});

// All Songs
app.get("/songs", async (req, res) => {
  const songs = await getSongs();
  res.send(page("All Songs", `
    <div class="page-title">All Songs</div>
    ${buildTable(songs)}
    <a href="/" class="btn btn-secondary">← Back</a>
    <a href="/add" class="btn btn-success" style="margin-left:10px;">+ Add Song</a>`));
});

// Songs by Director
app.get("/songs/director/:name", async (req, res) => {
  const name  = req.params.name;
  const songs = await getSongs({ Music_director: name });
  res.send(page(`Director: ${name}`, `
    <div class="page-title">Songs by Director: ${name}</div>
    ${buildTable(songs)}
    <a href="/" class="btn btn-secondary">← Back</a>`));
});

// Filter by Director + Singer
app.get("/songs/filter", async (req, res) => {
  const { director, singer } = req.query;
  if (!director || !singer) {
    return res.send(page("Filter", `
      <div class="page-title">Filter Songs</div>
      <div class="alert alert-error">Provide both <strong>director</strong> and <strong>singer</strong> params.<br>
        Example: <code>/songs/filter?director=Pritam&amp;singer=Arijit Singh</code></div>
      <a href="/" class="btn btn-secondary">← Back</a>`));
  }
  const songs = await getSongs({ Music_director: director, Singer: singer });
  res.send(page("Filter", `
    <div class="page-title">Director: ${director} &amp; Singer: ${singer}</div>
    ${buildTable(songs)}
    <a href="/" class="btn btn-secondary">← Back</a>`));
});

// Filter by Film + Singer
app.get("/songs/film", async (req, res) => {
  const { film, singer } = req.query;
  if (!film || !singer) {
    return res.send(page("Filter", `
      <div class="page-title">Filter by Film + Singer</div>
      <div class="alert alert-error">Provide both <strong>film</strong> and <strong>singer</strong> params.<br>
        Example: <code>/songs/film?film=Brahmastra&amp;singer=Arijit Singh</code></div>
      <a href="/" class="btn btn-secondary">← Back</a>`));
  }
  const songs = await getSongs({ Film: film, Singer: singer });
  res.send(page("Film Filter", `
    <div class="page-title">Film: ${film} &amp; Singer: ${singer}</div>
    ${buildTable(songs)}
    <a href="/" class="btn btn-secondary">← Back</a>`));
});

// Add Song — form
app.get("/add", (req, res) => {
  res.send(page("Add Song", `
    <div class="page-title">Add New Song</div>
    <div class="form-card">
      <form method="POST" action="/add">
        <div class="form-group"><label>Song Name *</label><input name="Songname" placeholder="e.g. Tum Hi Ho" required/></div>
        <div class="form-group"><label>Film *</label><input name="Film" placeholder="e.g. Aashiqui 2" required/></div>
        <div class="form-group"><label>Music Director *</label><input name="Music_director" placeholder="e.g. Pritam" required/></div>
        <div class="form-group"><label>Singer *</label><input name="Singer" placeholder="e.g. Arijit Singh" required/></div>
        <div class="form-row">
          <div class="form-group"><label>Actor</label><input name="Actor" placeholder="Optional"/></div>
          <div class="form-group"><label>Actress</label><input name="Actress" placeholder="Optional"/></div>
        </div>
        <button type="submit" class="btn btn-success" style="width:100%;padding:13px;font-size:15px;">➕ Add Song</button>
      </form>
    </div><br>
    <a href="/" class="btn btn-secondary">← Back</a>`));
});

// Add Song — save
app.post("/add", async (req, res) => {
  const song = {
    Songname: req.body.Songname, Film: req.body.Film,
    Music_director: req.body.Music_director, Singer: req.body.Singer,
    Actor: req.body.Actor || "", Actress: req.body.Actress || ""
  };
  useDB ? await Song.create(song) : songsArray.push(song);
  res.send(page("Song Added", `
    <div class="page-title">Song Added</div>
    <div class="alert alert-success">✅ "<strong>${song.Songname}</strong>" added successfully!</div>
    <a href="/songs" class="btn btn-primary">View All Songs</a>
    <a href="/add" class="btn btn-success" style="margin-left:10px;">+ Add Another</a>
    <a href="/" class="btn btn-secondary" style="margin-left:10px;">← Home</a>`));
});

// Update Song — form
app.get("/update/:songname", (req, res) => {
  const name = req.params.songname;
  res.send(page("Update Song", `
    <div class="page-title">Update Song: ${name}</div>
    <div class="form-card">
      <p style="color:#aaa;margin-bottom:20px;font-size:14px;">Add Actor and Actress details for this song.</p>
      <form method="POST" action="/update/${encodeURIComponent(name)}">
        <div class="form-row">
          <div class="form-group"><label>Actor *</label><input name="Actor" placeholder="e.g. Ranbir Kapoor" required/></div>
          <div class="form-group"><label>Actress *</label><input name="Actress" placeholder="e.g. Alia Bhatt" required/></div>
        </div>
        <button type="submit" class="btn btn-warning" style="width:100%;padding:13px;font-size:15px;">✏️ Update Song</button>
      </form>
    </div><br>
    <a href="/songs" class="btn btn-secondary">← Back to Songs</a>`));
});

// Update Song — save
app.post("/update/:songname", async (req, res) => {
  const name = req.params.songname;
  const { Actor, Actress } = req.body;
  let success = false;

  if (useDB) {
    const r = await Song.updateOne({ Songname: name }, { $set: { Actor, Actress } });
    success = r.matchedCount > 0;
  } else {
    const s = songsArray.find(s => s.Songname === name);
    if (s) { s.Actor = Actor; s.Actress = Actress; success = true; }
  }

  res.send(page("Updated", `
    <div class="page-title">Update Song</div>
    <div class="alert ${success ? "alert-success" : "alert-error"}">
      ${success
        ? `✅ "<strong>${name}</strong>" updated — Actor: ${Actor}, Actress: ${Actress}`
        : `❌ Song "<strong>${name}</strong>" not found.`}
    </div>
    <a href="/songs" class="btn btn-primary">View All Songs</a>
    <a href="/" class="btn btn-secondary" style="margin-left:10px;">← Home</a>`));
});

// Delete Song
app.get("/delete/:songname", async (req, res) => {
  const name = req.params.songname;
  let success = false;

  if (useDB) {
    const r = await Song.deleteOne({ Songname: name });
    success = r.deletedCount > 0;
  } else {
    const i = songsArray.findIndex(s => s.Songname === name);
    if (i !== -1) { songsArray.splice(i, 1); success = true; }
  }

  res.send(page("Delete", `
    <div class="page-title">Delete Song</div>
    <div class="alert ${success ? "alert-success" : "alert-error"}">
      ${success
        ? `✅ "<strong>${name}</strong>" deleted successfully.`
        : `❌ Song "<strong>${name}</strong>" not found.`}
    </div>
    <a href="/songs" class="btn btn-primary">View All Songs</a>
    <a href="/" class="btn btn-secondary" style="margin-left:10px;">← Home</a>`));
});

// -----------------------------------------------
// Start Server
// -----------------------------------------------
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
