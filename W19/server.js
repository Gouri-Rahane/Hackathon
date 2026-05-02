// Student Marks CRUD Application
// Using Express.js and MongoDB (with array fallback)

const express = require('express');
const app = express();

app.use(express.json());

// =============================================
// Try to connect to MongoDB
// If not available, use in-memory array
// =============================================

let useDB = true;
let StudentModel = null;

// Sample student data
const sampleStudents = [
    { Name: "Amit Sharma",    Roll_No: 1, WAD_Marks: 35, CC_Marks: 38, DSBDA_Marks: 28, CNS_Marks: 30, AI_Marks: 32 },
    { Name: "Priya Patil",    Roll_No: 2, WAD_Marks: 40, CC_Marks: 42, DSBDA_Marks: 22, CNS_Marks: 45, AI_Marks: 38 },
    { Name: "Rahul Desai",    Roll_No: 3, WAD_Marks: 18, CC_Marks: 35, DSBDA_Marks: 15, CNS_Marks: 38, AI_Marks: 20 },
    { Name: "Sneha Joshi",    Roll_No: 4, WAD_Marks: 27, CC_Marks: 30, DSBDA_Marks: 26, CNS_Marks: 28, AI_Marks: 29 },
    { Name: "Karan Mehta",    Roll_No: 5, WAD_Marks: 45, CC_Marks: 48, DSBDA_Marks: 30, CNS_Marks: 47, AI_Marks: 44 },
    { Name: "Pooja Kulkarni", Roll_No: 6, WAD_Marks: 22, CC_Marks: 25, DSBDA_Marks: 19, CNS_Marks: 20, AI_Marks: 23 },
    { Name: "Vikas Nair",     Roll_No: 7, WAD_Marks: 38, CC_Marks: 36, DSBDA_Marks: 33, CNS_Marks: 39, AI_Marks: 37 }
];

// In-memory array fallback (deep copy)
let studentsArray = JSON.parse(JSON.stringify(sampleStudents));

// =============================================
// Connect to MongoDB
// =============================================
async function connectDB() {
    try {
        const mongoose = require('mongoose');

        await mongoose.connect('mongodb://127.0.0.1:27017/student', {
            serverSelectionTimeoutMS: 3000
        });

        console.log("Connected to MongoDB successfully!");

        const studentSchema = new mongoose.Schema({
            Name:         String,
            Roll_No:      Number,
            WAD_Marks:    Number,
            CC_Marks:     Number,
            DSBDA_Marks:  Number,
            CNS_Marks:    Number,
            AI_Marks:     Number
        });

        StudentModel = mongoose.model('studentmarks', studentSchema);

        const count = await StudentModel.countDocuments();
        if (count === 0) {
            await StudentModel.insertMany(sampleStudents);
            console.log("Sample data inserted into MongoDB!");
        }

        useDB = true;

    } catch (err) {
        console.log("MongoDB not available. Using in-memory array instead.");
        console.log("Reason:", err.message);
        useDB = false;
    }
}

// =============================================
// CSS Styles (shared across all pages)
// =============================================
const globalCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f0f4f8;
        color: #333;
        min-height: 100vh;
    }

    /* Top navbar */
    .navbar {
        background: linear-gradient(135deg, #1a237e, #283593);
        color: white;
        padding: 16px 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    }
    .navbar h1 {
        font-size: 22px;
        letter-spacing: 1px;
    }
    .navbar .badge {
        background: ${useDB ? '#43a047' : '#e65100'};
        padding: 5px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: bold;
    }

    /* Main container */
    .container {
        max-width: 1100px;
        margin: 30px auto;
        padding: 0 20px;
    }

    /* Page title */
    .page-title {
        font-size: 24px;
        font-weight: 700;
        color: #1a237e;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 3px solid #3f51b5;
    }

    /* Info / count card */
    .info-card {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        margin-bottom: 25px;
    }
    .count-number {
        font-size: 64px;
        font-weight: 800;
        color: #3f51b5;
        line-height: 1;
    }
    .count-label {
        font-size: 16px;
        color: #777;
        margin-top: 6px;
    }

    /* Table */
    .table-wrapper {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        overflow: hidden;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    thead {
        background: linear-gradient(135deg, #1a237e, #3f51b5);
        color: white;
    }
    thead th {
        padding: 14px 18px;
        text-align: left;
        font-size: 14px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    tbody tr {
        border-bottom: 1px solid #e8eaf6;
        transition: background 0.2s;
    }
    tbody tr:hover {
        background: #e8eaf6;
    }
    tbody tr:last-child {
        border-bottom: none;
    }
    tbody td {
        padding: 13px 18px;
        font-size: 15px;
    }
    tbody td:first-child {
        font-weight: 600;
        color: #1a237e;
    }

    /* Mark badges */
    .mark {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
    }
    .mark-high  { background: #e8f5e9; color: #2e7d32; }
    .mark-mid   { background: #fff8e1; color: #f57f17; }
    .mark-low   { background: #ffebee; color: #c62828; }

    /* Alert / message box */
    .alert {
        padding: 18px 24px;
        border-radius: 10px;
        font-size: 16px;
        margin-bottom: 20px;
    }
    .alert-success { background: #e8f5e9; color: #2e7d32; border-left: 5px solid #43a047; }
    .alert-error   { background: #ffebee; color: #c62828; border-left: 5px solid #e53935; }
    .alert-info    { background: #e3f2fd; color: #1565c0; border-left: 5px solid #1e88e5; }

    /* Back button */
    .btn-back {
        display: inline-block;
        margin-top: 22px;
        padding: 10px 22px;
        background: #3f51b5;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        transition: background 0.2s;
    }
    .btn-back:hover { background: #1a237e; }

    /* Home page cards */
    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 18px;
        margin-top: 10px;
    }
    .card {
        background: white;
        border-radius: 12px;
        padding: 22px 24px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.07);
        text-decoration: none;
        color: #333;
        border-left: 5px solid #3f51b5;
        transition: transform 0.2s, box-shadow 0.2s;
        display: block;
    }
    .card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.13);
    }
    .card .card-icon { font-size: 28px; margin-bottom: 10px; }
    .card .card-title { font-size: 16px; font-weight: 700; color: #1a237e; margin-bottom: 5px; }
    .card .card-route { font-size: 13px; color: #888; font-family: monospace; }

    .card.green  { border-left-color: #43a047; }
    .card.orange { border-left-color: #fb8c00; }
    .card.red    { border-left-color: #e53935; }
    .card.teal   { border-left-color: #00897b; }
    .card.purple { border-left-color: #8e24aa; }

    /* No result */
    .no-result {
        text-align: center;
        padding: 50px 20px;
        color: #999;
        font-size: 16px;
    }
    .no-result span { font-size: 48px; display: block; margin-bottom: 12px; }

    /* Footer */
    .footer {
        text-align: center;
        padding: 20px;
        color: #aaa;
        font-size: 13px;
        margin-top: 40px;
    }
`;

// =============================================
// Helper: wrap page with navbar + styles
// =============================================
function buildPage(title, content, showBack = true) {
    const modeBadge = useDB ? '🟢 MongoDB' : '🟡 Array Mode';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Student Marks</title>
    <style>${globalCSS}</style>
</head>
<body>
    <div class="navbar">
        <h1>🎓 Student Marks System</h1>
        <span class="badge">${modeBadge}</span>
    </div>
    <div class="container">
        <div class="page-title">${title}</div>
        ${content}
        ${showBack ? '<a href="/" class="btn-back">&#8592; Back to Home</a>' : ''}
    </div>
    <div class="footer">Student Marks CRUD App &mdash; Express.js + MongoDB</div>
</body>
</html>`;
}

// =============================================
// Helper: Build HTML table with colored marks
// =============================================
function markBadge(val) {
    let cls = val >= 35 ? 'mark-high' : val >= 25 ? 'mark-mid' : 'mark-low';
    return `<span class="mark ${cls}">${val}</span>`;
}

function buildTable(students) {
    if (!students || students.length === 0) {
        return `<div class="table-wrapper">
            <div class="no-result">
                <span>📭</span>No students found matching this criteria.
            </div>
        </div>`;
    }

    let rows = '';
    students.forEach((s, i) => {
        rows += `
        <tr>
            <td>${i + 1}</td>
            <td>${s.Name}</td>
            <td>${s.Roll_No}</td>
            <td>${markBadge(s.WAD_Marks)}</td>
            <td>${markBadge(s.CC_Marks)}</td>
            <td>${markBadge(s.DSBDA_Marks)}</td>
            <td>${markBadge(s.CNS_Marks)}</td>
            <td>${markBadge(s.AI_Marks)}</td>
        </tr>`;
    });

    return `
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>WAD</th>
                    <th>CC</th>
                    <th>DSBDA</th>
                    <th>CNS</th>
                    <th>AI</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>
    <p style="margin-top:12px; color:#888; font-size:14px;">Showing <b>${students.length}</b> record(s)</p>`;
}

// =============================================
// ROUTES
// =============================================

// Home page
app.get('/', (req, res) => {
    const content = `
    <div class="alert alert-info" style="margin-bottom:25px;">
        ℹ️ Database Mode: <b>${useDB ? 'MongoDB (mongodb://127.0.0.1:27017/student)' : 'In-Memory Array (MongoDB not running)'}</b>
    </div>
    <div class="cards-grid">
        <a href="/count" class="card">
            <div class="card-icon">🔢</div>
            <div class="card-title">Total Student Count</div>
            <div class="card-route">GET /count</div>
        </a>
        <a href="/students" class="card green">
            <div class="card-icon">👨‍🎓</div>
            <div class="card-title">All Students</div>
            <div class="card-route">GET /students</div>
        </a>
        <a href="/students/dsbda" class="card teal">
            <div class="card-icon">📊</div>
            <div class="card-title">DSBDA Marks &gt; 20</div>
            <div class="card-route">GET /students/dsbda</div>
        </a>
        <a href="/students/top" class="card purple">
            <div class="card-icon">🏆</div>
            <div class="card-title">Top Students (All &gt; 25)</div>
            <div class="card-route">GET /students/top</div>
        </a>
        <a href="/students/failed" class="card red">
            <div class="card-icon">⚠️</div>
            <div class="card-title">CNS &lt; 40 AND CC &lt; 40</div>
            <div class="card-route">GET /students/failed</div>
        </a>
        <a href="/update/Rahul Desai" class="card orange">
            <div class="card-icon">✏️</div>
            <div class="card-title">Update: +10 Marks (Rahul Desai)</div>
            <div class="card-route">GET /update/:name</div>
        </a>
        <a href="/delete/Pooja Kulkarni" class="card red">
            <div class="card-icon">🗑️</div>
            <div class="card-title">Delete: Pooja Kulkarni</div>
            <div class="card-route">GET /delete/:name</div>
        </a>
    </div>`;

    res.send(buildPage('Dashboard', content, false));
});

// -----------------------------------------------
// a) Count total documents
// Route: /count
// -----------------------------------------------
app.get('/count', async (req, res) => {
    let count;

    if (useDB) {
        count = await StudentModel.countDocuments();
    } else {
        count = studentsArray.length;
    }

    const content = `
    <div class="info-card" style="text-align:center;">
        <div class="count-number">${count}</div>
        <div class="count-label">Total Students in Database</div>
    </div>`;

    res.send(buildPage('Total Student Count', content));
});

// -----------------------------------------------
// b) Display all students
// Route: /students
// -----------------------------------------------
app.get('/students', async (req, res) => {
    let students;

    if (useDB) {
        students = await StudentModel.find();
    } else {
        students = studentsArray;
    }

    res.send(buildPage('All Students', buildTable(students)));
});

// -----------------------------------------------
// c) Students with DSBDA > 20
// Route: /students/dsbda
// -----------------------------------------------
app.get('/students/dsbda', async (req, res) => {
    let students;

    if (useDB) {
        students = await StudentModel.find({ DSBDA_Marks: { $gt: 20 } });
    } else {
        students = studentsArray.filter(s => s.DSBDA_Marks > 20);
    }

    const info = `<div class="alert alert-info">Showing students who scored <b>more than 20 marks</b> in DSBDA.</div>`;
    res.send(buildPage('DSBDA Marks > 20', info + buildTable(students)));
});

// -----------------------------------------------
// e) Students with ALL subjects > 25
// Route: /students/top
// -----------------------------------------------
app.get('/students/top', async (req, res) => {
    let students;

    if (useDB) {
        students = await StudentModel.find({
            WAD_Marks:   { $gt: 25 },
            CC_Marks:    { $gt: 25 },
            DSBDA_Marks: { $gt: 25 },
            CNS_Marks:   { $gt: 25 },
            AI_Marks:    { $gt: 25 }
        });
    } else {
        students = studentsArray.filter(s =>
            s.WAD_Marks   > 25 &&
            s.CC_Marks    > 25 &&
            s.DSBDA_Marks > 25 &&
            s.CNS_Marks   > 25 &&
            s.AI_Marks    > 25
        );
    }

    const info = `<div class="alert alert-success">Showing students who scored <b>more than 25 marks in ALL subjects</b>.</div>`;
    res.send(buildPage('Top Students (All Subjects > 25)', info + buildTable(students)));
});

// -----------------------------------------------
// f) Students with CNS < 40 AND CC < 40
// Route: /students/failed
// -----------------------------------------------
app.get('/students/failed', async (req, res) => {
    let students;

    if (useDB) {
        students = await StudentModel.find({
            CNS_Marks: { $lt: 40 },
            CC_Marks:  { $lt: 40 }
        });
    } else {
        students = studentsArray.filter(s =>
            s.CNS_Marks < 40 && s.CC_Marks < 40
        );
    }

    const info = `<div class="alert alert-error">Showing students who scored <b>less than 40 in both CNS and CC</b>.</div>`;
    res.send(buildPage('Students: CNS < 40 AND CC < 40', info + buildTable(students)));
});

// -----------------------------------------------
// d) Update: Add 10 marks to a student
// Route: /update/:name
// -----------------------------------------------
app.get('/update/:name', async (req, res) => {
    const name = req.params.name;

    if (useDB) {
        const result = await StudentModel.findOneAndUpdate(
            { Name: name },
            {
                $inc: {
                    WAD_Marks:   10,
                    CC_Marks:    10,
                    DSBDA_Marks: 10,
                    CNS_Marks:   10,
                    AI_Marks:    10
                }
            },
            { new: true }
        );

        if (!result) {
            const err = `<div class="alert alert-error">❌ Student "<b>${name}</b>" not found in database.</div>`;
            return res.send(buildPage('Update Failed', err));
        }

        const msg = `<div class="alert alert-success">✅ Successfully added <b>10 marks</b> to all subjects for <b>${name}</b>.</div>`;
        res.send(buildPage(`Updated: ${name}`, msg + buildTable([result])));

    } else {
        const student = studentsArray.find(s => s.Name === name);

        if (!student) {
            const err = `<div class="alert alert-error">❌ Student "<b>${name}</b>" not found.</div>`;
            return res.send(buildPage('Update Failed', err));
        }

        student.WAD_Marks   += 10;
        student.CC_Marks    += 10;
        student.DSBDA_Marks += 10;
        student.CNS_Marks   += 10;
        student.AI_Marks    += 10;

        const msg = `<div class="alert alert-success">✅ Successfully added <b>10 marks</b> to all subjects for <b>${name}</b>.</div>`;
        res.send(buildPage(`Updated: ${name}`, msg + buildTable([student])));
    }
});

// -----------------------------------------------
// g) Delete a student by name
// Route: /delete/:name
// -----------------------------------------------
app.get('/delete/:name', async (req, res) => {
    const name = req.params.name;

    if (useDB) {
        const result = await StudentModel.findOneAndDelete({ Name: name });

        if (!result) {
            const err = `<div class="alert alert-error">❌ Student "<b>${name}</b>" not found in database.</div>`;
            return res.send(buildPage('Delete Failed', err));
        }

        const msg = `
        <div class="alert alert-success">✅ Student <b>${name}</b> has been successfully deleted from the database.</div>
        <div class="info-card">
            <p style="color:#555;">The record has been permanently removed. 
            <a href="/students" style="color:#3f51b5;">View remaining students →</a></p>
        </div>`;
        res.send(buildPage('Student Deleted', msg));

    } else {
        const index = studentsArray.findIndex(s => s.Name === name);

        if (index === -1) {
            const err = `<div class="alert alert-error">❌ Student "<b>${name}</b>" not found.</div>`;
            return res.send(buildPage('Delete Failed', err));
        }

        studentsArray.splice(index, 1);

        const msg = `
        <div class="alert alert-success">✅ Student <b>${name}</b> has been successfully removed.</div>
        <div class="info-card">
            <p style="color:#555;">The record has been removed from the array. 
            <a href="/students" style="color:#3f51b5;">View remaining students →</a></p>
        </div>`;
        res.send(buildPage('Student Deleted', msg));
    }
});

// =============================================
// Start server
// =============================================
connectDB().then(() => {
    app.listen(3000, () => {
        console.log("====================================");
        console.log("  Server running at http://localhost:3000");
        console.log("  Mode:", useDB ? "MongoDB" : "In-Memory Array");
        console.log("====================================");
    });
});
