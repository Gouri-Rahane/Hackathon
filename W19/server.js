const express = require('express');
const app = express();
app.use(express.json());

let useDB = false, StudentModel = null;

const sampleStudents = [
    { Name: "Amit Sharma",    Roll_No: 1, WAD_Marks: 35, CC_Marks: 38, DSBDA_Marks: 28, CNS_Marks: 30, AI_Marks: 32 },
    { Name: "Priya Patil",    Roll_No: 2, WAD_Marks: 40, CC_Marks: 42, DSBDA_Marks: 22, CNS_Marks: 45, AI_Marks: 38 },
    { Name: "Rahul Desai",    Roll_No: 3, WAD_Marks: 18, CC_Marks: 35, DSBDA_Marks: 15, CNS_Marks: 38, AI_Marks: 20 },
    { Name: "Sneha Joshi",    Roll_No: 4, WAD_Marks: 27, CC_Marks: 30, DSBDA_Marks: 26, CNS_Marks: 28, AI_Marks: 29 },
    { Name: "Karan Mehta",    Roll_No: 5, WAD_Marks: 45, CC_Marks: 48, DSBDA_Marks: 30, CNS_Marks: 47, AI_Marks: 44 },
    { Name: "Pooja Kulkarni", Roll_No: 6, WAD_Marks: 22, CC_Marks: 25, DSBDA_Marks: 19, CNS_Marks: 20, AI_Marks: 23 },
    { Name: "Vikas Nair",     Roll_No: 7, WAD_Marks: 38, CC_Marks: 36, DSBDA_Marks: 33, CNS_Marks: 39, AI_Marks: 37 }
];

let studentsArray = JSON.parse(JSON.stringify(sampleStudents));

async function connectDB() {
    try {
        const mongoose = require('mongoose');
        await mongoose.connect('mongodb://127.0.0.1:27017/student', { serverSelectionTimeoutMS: 3000 });
        const schema = new mongoose.Schema({ Name: String, Roll_No: Number, WAD_Marks: Number, CC_Marks: Number, DSBDA_Marks: Number, CNS_Marks: Number, AI_Marks: Number });
        StudentModel = mongoose.model('studentmarks', schema);
        if (await StudentModel.countDocuments() === 0) await StudentModel.insertMany(sampleStudents);
        useDB = true;
        console.log("Connected to MongoDB");
    } catch (e) {
        console.log("Using in-memory array:", e.message);
    }
}

// ── UI helpers ──────────────────────────────────────────────────────────────
const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:sans-serif;background:#f5f5f5;color:#333}
.nav{background:#1a237e;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.nav h1{font-size:18px}
.badge{background:${useDB?'#43a047':'#e65100'};padding:4px 12px;border-radius:12px;font-size:12px}
.wrap{max-width:1000px;margin:24px auto;padding:0 16px}
.title{font-size:20px;font-weight:700;color:#1a237e;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #3f51b5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.card{background:#fff;border-radius:8px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.08);text-decoration:none;color:#333;border-left:4px solid #3f51b5;display:block}
.card:hover{box-shadow:0 4px 16px rgba(0,0,0,.14)}
.card b{display:block;color:#1a237e;margin-bottom:4px}
.card small{color:#888;font-family:monospace}
.card.g{border-color:#43a047}.card.o{border-color:#fb8c00}.card.r{border-color:#e53935}.card.t{border-color:#00897b}.card.p{border-color:#8e24aa}
.alert{padding:12px 18px;border-radius:6px;margin-bottom:16px;font-size:14px}
.ok{background:#e8f5e9;color:#2e7d32;border-left:4px solid #43a047}
.err{background:#ffebee;color:#c62828;border-left:4px solid #e53935}
.info{background:#e3f2fd;color:#1565c0;border-left:4px solid #1e88e5}
.box{background:#fff;border-radius:8px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:16px}
.big{font-size:56px;font-weight:800;color:#3f51b5}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
thead{background:#1a237e;color:#fff}
th{padding:11px 14px;text-align:left;font-size:13px;text-transform:uppercase}
td{padding:10px 14px;font-size:14px;border-bottom:1px solid #eee}
tr:last-child td{border:none}
tr:hover td{background:#f0f4ff}
.m{display:inline-block;padding:2px 8px;border-radius:10px;font-size:13px;font-weight:600}
.mh{background:#e8f5e9;color:#2e7d32}.mm{background:#fff8e1;color:#f57f17}.ml{background:#ffebee;color:#c62828}
.back{display:inline-block;margin-top:18px;padding:8px 18px;background:#3f51b5;color:#fff;text-decoration:none;border-radius:6px;font-size:13px}
.back:hover{background:#1a237e}
.none{text-align:center;padding:40px;color:#999}
`;

function page(title, body, back = true) {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>${css}</style></head><body>
<div class="nav"><h1>Student Marks</h1><span class="badge">${useDB ? 'MongoDB' : 'Array Mode'}</span></div>
<div class="wrap"><div class="title">${title}</div>${body}
${back ? '<a href="/" class="back">Back to Home</a>' : ''}</div></body></html>`;
}

function badge(v) {
    return `<span class="m ${v>=35?'mh':v>=25?'mm':'ml'}">${v}</span>`;
}

function table(rows) {
    if (!rows || !rows.length) return `<div class="none">No students found.</div>`;
    return `<table><thead><tr><th>#</th><th>Name</th><th>Roll</th><th>WAD</th><th>CC</th><th>DSBDA</th><th>CNS</th><th>AI</th></tr></thead><tbody>
${rows.map((s,i)=>`<tr><td>${i+1}</td><td>${s.Name}</td><td>${s.Roll_No}</td><td>${badge(s.WAD_Marks)}</td><td>${badge(s.CC_Marks)}</td><td>${badge(s.DSBDA_Marks)}</td><td>${badge(s.CNS_Marks)}</td><td>${badge(s.AI_Marks)}</td></tr>`).join('')}
</tbody></table><p style="margin-top:10px;color:#888;font-size:13px">${rows.length} record(s)</p>`;
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send(page('Dashboard', `
<div class="alert info">Mode: <b>${useDB ? 'MongoDB' : 'In-Memory Array'}</b></div>
<div class="grid">
  <a href="/count"           class="card">  <b>Total Count</b>              <small>GET /count</small></a>
  <a href="/students"        class="card g"> <b>All Students</b>             <small>GET /students</small></a>
  <a href="/students/dsbda"  class="card t"> <b>DSBDA Marks &gt; 20</b>      <small>GET /students/dsbda</small></a>
  <a href="/students/top"    class="card p"> <b>Top Students (All &gt; 25)</b><small>GET /students/top</small></a>
  <a href="/students/failed" class="card r"> <b>CNS &lt; 40 AND CC &lt; 40</b><small>GET /students/failed</small></a>
  <a href="/update/Rahul Desai"   class="card o"> <b>Update: Rahul Desai +10</b>  <small>GET /update/:name</small></a>
  <a href="/delete/Pooja Kulkarni" class="card r"> <b>Delete: Pooja Kulkarni</b>   <small>GET /delete/:name</small></a>
</div>`, false)));

app.get('/count', async (req, res) => {
    const count = useDB ? await StudentModel.countDocuments() : studentsArray.length;
    res.send(page('Total Count', `<div class="box" style="text-align:center"><div class="big">${count}</div><p style="color:#777;margin-top:6px">Total Students</p></div>`));
});

app.get('/students', async (req, res) => {
    const data = useDB ? await StudentModel.find() : studentsArray;
    res.send(page('All Students', table(data)));
});

app.get('/students/dsbda', async (req, res) => {
    const data = useDB ? await StudentModel.find({ DSBDA_Marks: { $gt: 20 } }) : studentsArray.filter(s => s.DSBDA_Marks > 20);
    res.send(page('DSBDA Marks > 20', `<div class="alert info">Students with DSBDA marks above 20.</div>` + table(data)));
});

app.get('/students/top', async (req, res) => {
    const q = { WAD_Marks:{$gt:25}, CC_Marks:{$gt:25}, DSBDA_Marks:{$gt:25}, CNS_Marks:{$gt:25}, AI_Marks:{$gt:25} };
    const data = useDB ? await StudentModel.find(q) : studentsArray.filter(s => s.WAD_Marks>25 && s.CC_Marks>25 && s.DSBDA_Marks>25 && s.CNS_Marks>25 && s.AI_Marks>25);
    res.send(page('Top Students', `<div class="alert ok">Students with all subjects above 25.</div>` + table(data)));
});

app.get('/students/failed', async (req, res) => {
    const data = useDB ? await StudentModel.find({ CNS_Marks:{$lt:40}, CC_Marks:{$lt:40} }) : studentsArray.filter(s => s.CNS_Marks<40 && s.CC_Marks<40);
    res.send(page('CNS < 40 AND CC < 40', `<div class="alert err">Students with CNS and CC both below 40.</div>` + table(data)));
});

app.get('/update/:name', async (req, res) => {
    const name = req.params.name;
    const inc = { WAD_Marks:10, CC_Marks:10, DSBDA_Marks:10, CNS_Marks:10, AI_Marks:10 };
    if (useDB) {
        const r = await StudentModel.findOneAndUpdate({ Name: name }, { $inc: inc }, { new: true });
        if (!r) return res.send(page('Update Failed', `<div class="alert err">Student "${name}" not found.</div>`));
        res.send(page(`Updated: ${name}`, `<div class="alert ok">Added 10 marks to all subjects for <b>${name}</b>.</div>` + table([r])));
    } else {
        const s = studentsArray.find(s => s.Name === name);
        if (!s) return res.send(page('Update Failed', `<div class="alert err">Student "${name}" not found.</div>`));
        Object.keys(inc).forEach(k => s[k] += 10);
        res.send(page(`Updated: ${name}`, `<div class="alert ok">Added 10 marks to all subjects for <b>${name}</b>.</div>` + table([s])));
    }
});

app.get('/delete/:name', async (req, res) => {
    const name = req.params.name;
    if (useDB) {
        const r = await StudentModel.findOneAndDelete({ Name: name });
        if (!r) return res.send(page('Delete Failed', `<div class="alert err">Student "${name}" not found.</div>`));
    } else {
        const i = studentsArray.findIndex(s => s.Name === name);
        if (i === -1) return res.send(page('Delete Failed', `<div class="alert err">Student "${name}" not found.</div>`));
        studentsArray.splice(i, 1);
    }
    res.send(page('Deleted', `<div class="alert ok"><b>${name}</b> has been removed. <a href="/students">View students</a></div>`));
});

// ── Start ────────────────────────────────────────────────────────────────────
connectDB().then(() => app.listen(3000, () => console.log(`Server: http://localhost:3000  [${useDB?'MongoDB':'Array'}]`)));
