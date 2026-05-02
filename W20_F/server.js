const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let usingMemory = false;
let memoryEmployees = [];
let nextId = 1;

mongoose.connect('mongodb://127.0.0.1:27017/company')
  .then(() => { usingMemory = false; })
  .catch(() => { usingMemory = true; });

const Employee = mongoose.model('Employee', new mongoose.Schema({
  name: String, department: String, designation: String,
  salary: Number, joining_date: String
}), 'employees');

// ── helpers ──────────────────────────────────────────────────────────────────

async function getAll() {
  return usingMemory ? memoryEmployees : await Employee.find();
}

function page(title, activePage, body) {
  const nav = (label, href, key) =>
    `<a href="${href}" class="${activePage === key ? 'active' : ''}">${label}</a>`;
  const mode = usingMemory ? 'In-Memory' : 'MongoDB';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title} – EMS</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; color: #222; font-size: 14px; }

    /* navbar */
    nav { background: #1e293b; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; height: 54px; }
    nav .brand { color: #fff; font-weight: 700; font-size: 15px; letter-spacing: .3px; }
    nav .brand span { color: #60a5fa; }
    nav .mode { font-size: 11px; color: #94a3b8; margin-left: 10px; }
    nav .links { display: flex; gap: 4px; }
    nav .links a { color: #94a3b8; text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 13px; transition: background .15s, color .15s; }
    nav .links a:hover { background: #334155; color: #e2e8f0; }
    nav .links a.active { background: #2563eb; color: #fff; }

    /* layout */
    .wrap { max-width: 1020px; margin: 32px auto; padding: 0 20px; }

    /* page header */
    .ph { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
    .ph h1 { font-size: 20px; font-weight: 700; color: #1e293b; }

    /* alert */
    .alert { padding: 10px 16px; background: #f0fdf4; border-left: 3px solid #22c55e; color: #166534; border-radius: 4px; margin-bottom: 18px; font-size: 13px; }

    /* stats */
    .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 22px; }
    .stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; }
    .stat .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 6px; }
    .stat .val { font-size: 24px; font-weight: 700; color: #1e293b; }

    /* table card */
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f8fafc; padding: 11px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #e2e8f0; }
    tbody td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #374151; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #f8fafc; }

    /* empty */
    .empty { text-align: center; padding: 52px 20px; color: #94a3b8; }
    .empty h3 { font-size: 16px; color: #64748b; margin-bottom: 6px; }
    .empty p { font-size: 13px; margin-bottom: 18px; }

    /* buttons */
    .btn { display: inline-block; padding: 5px 13px; font-size: 13px; border-radius: 5px; text-decoration: none; border: 1px solid #d1d5db; color: #374151; background: #fff; cursor: pointer; transition: background .15s; }
    .btn:hover { background: #f3f4f6; }
    .btn-danger { color: #b91c1c; border-color: #fca5a5; }
    .btn-danger:hover { background: #fef2f2; }
    .btn-primary { background: #2563eb; color: #fff; border-color: #2563eb; padding: 8px 18px; font-size: 13px; font-weight: 600; border-radius: 6px; }
    .btn-primary:hover { background: #1d4ed8; border-color: #1d4ed8; }

    /* form */
    .form-wrap { max-width: 520px; margin: 32px auto; padding: 0 20px; }
    .back-link { display: inline-block; color: #2563eb; text-decoration: none; font-size: 13px; margin-bottom: 16px; }
    .back-link:hover { text-decoration: underline; }
    .form-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .form-head { padding: 18px 24px; border-bottom: 1px solid #e2e8f0; }
    .form-head h2 { font-size: 17px; font-weight: 700; color: #1e293b; }
    .form-head p { font-size: 12px; color: #64748b; margin-top: 3px; }
    .form-body { padding: 22px 24px; display: grid; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .fg label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; }
    .fg input { width: 100%; padding: 8px 11px; border: 1px solid #d1d5db; border-radius: 5px; font-size: 14px; color: #111; outline: none; transition: border-color .15s; }
    .fg input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .fg input[readonly] { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
    .form-foot { padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .cancel { color: #64748b; text-decoration: none; font-size: 13px; }
    .cancel:hover { color: #111; text-decoration: underline; }

    @media(max-width:600px) {
      .stats, .form-row { grid-template-columns: 1fr; }
      nav { padding: 0 16px; }
      .wrap, .form-wrap { padding: 0 12px; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="brand">EMS <span>·</span> Employee Management <span class="mode">${mode}</span></div>
    <div class="links">
      ${nav('Employees', '/employees', 'list')}
      ${nav('Add Employee', '/add', 'add')}
    </div>
  </nav>
  ${body}
</body>
</html>`;
}

function listPage(employees, message) {
  const total = employees.length;
  const totalSal = employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const depts = new Set(employees.map(e => e.department).filter(Boolean)).size;
  const avg = total ? Math.round(totalSal / total) : 0;

  const alert = message ? `<div class="alert">${message}</div>` : '';

  const stats = `
    <div class="stats">
      <div class="stat"><div class="lbl">Total Employees</div><div class="val">${total}</div></div>
      <div class="stat"><div class="lbl">Departments</div><div class="val">${depts}</div></div>
      <div class="stat"><div class="lbl">Avg. Salary</div><div class="val">&#8377;${avg.toLocaleString()}</div></div>
    </div>`;

  const tableOrEmpty = total === 0
    ? `<div class="card"><div class="empty">
        <h3>No Employees Found</h3>
        <p>Start by adding your first employee.</p>
        <a href="/add" class="btn-primary">Add Employee</a>
       </div></div>`
    : `<div class="card"><table>
        <thead><tr>
          <th>Name</th><th>Department</th><th>Designation</th>
          <th>Salary</th><th>Joining Date</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${employees.map(e => {
            const enc = encodeURIComponent(e.name);
            return `<tr>
            <td><strong>${e.name}</strong></td>
            <td>${e.department}</td>
            <td>${e.designation}</td>
            <td>&#8377;${Number(e.salary).toLocaleString()}</td>
            <td>${e.joining_date}</td>
            <td>
              <a href="/edit/${enc}" class="btn">Edit</a>
              <a href="/delete/${enc}" class="btn btn-danger"
                onclick="return confirm('Delete ${e.name}?')">Delete</a>
            </td>
          </tr>`;
          }).join('')}
        </tbody>
      </table></div>`;

  return page('Employees', 'list', `
    <div class="wrap">
      <div class="ph"><h1>Employee Records</h1><a href="/add" class="btn-primary">+ Add Employee</a></div>
      ${alert}${stats}${tableOrEmpty}
    </div>`);
}

function formPage(emp, isEdit) {
  const v = f => emp ? (emp[f] || '') : '';
  const title = isEdit ? 'Edit Employee' : 'Add New Employee';
  const sub   = isEdit ? `Editing record for ${v('name')}` : 'Fill in the details below';
  const action = isEdit ? `/update/${encodeURIComponent(v('name'))}` : '/add';
  const btn   = isEdit ? 'Save Changes' : 'Add Employee';

  return page(title, isEdit ? '' : 'add', `
    <div class="form-wrap">
      <a href="/employees" class="back-link">← Back to list</a>
      <div class="form-card">
        <div class="form-head"><h2>${title}</h2><p>${sub}</p></div>
        <form method="POST" action="${action}">
          <div class="form-body">
            <div class="fg">
              <label>Full Name</label>
              <input type="text" name="name" value="${v('name')}" placeholder="e.g. Rahul Sharma" ${isEdit ? 'readonly' : 'required'}/>
            </div>
            <div class="form-row">
              <div class="fg"><label>Department</label><input type="text" name="department" value="${v('department')}" placeholder="e.g. Engineering" required/></div>
              <div class="fg"><label>Designation</label><input type="text" name="designation" value="${v('designation')}" placeholder="e.g. Software Engineer" required/></div>
            </div>
            <div class="form-row">
              <div class="fg"><label>Salary (&#8377;)</label><input type="number" name="salary" value="${v('salary')}" placeholder="e.g. 50000" required/></div>
              <div class="fg"><label>Joining Date</label><input type="date" name="joining_date" value="${v('joining_date')}" required/></div>
            </div>
          </div>
          <div class="form-foot">
            <a href="/employees" class="cancel">Cancel</a>
            <button type="submit" class="btn-primary">${btn}</button>
          </div>
        </form>
      </div>
    </div>`);
}

// ── routes ────────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.redirect('/employees'));

app.get('/employees', async (_req, res) => {
  try { res.send(listPage(await getAll(), '')); }
  catch (e) { res.send('Error: ' + e.message); }
});

app.get('/add', (_req, res) => res.send(formPage(null, false)));

app.post('/add', async (req, res) => {
  const { name, department, designation, salary, joining_date } = req.body;
  try {
    if (usingMemory) {
      memoryEmployees.push({ id: nextId++, name, department, designation, salary, joining_date });
    } else {
      await new Employee({ name, department, designation, salary, joining_date }).save();
    }
    res.send(listPage(await getAll(), `Employee "${name}" added successfully!`));
  } catch (e) { res.send('Error: ' + e.message); }
});

app.get('/edit/:name', async (req, res) => {
  try {
    const empName = decodeURIComponent(req.params.name);
    const emp = usingMemory
      ? memoryEmployees.find(e => e.name === empName)
      : await Employee.findOne({ name: empName });
    emp ? res.send(formPage(emp, true)) : res.send('Employee not found.');
  } catch (e) { res.send('Error: ' + e.message); }
});

app.post('/update/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const data = { department: req.body.department, designation: req.body.designation,
                 salary: req.body.salary, joining_date: req.body.joining_date };
  try {
    if (usingMemory) {
      const i = memoryEmployees.findIndex(e => e.name === name);
      if (i === -1) return res.send('Employee not found.');
      Object.assign(memoryEmployees[i], data);
    } else {
      await Employee.findOneAndUpdate({ name }, data);
    }
    res.send(listPage(await getAll(), `Employee "${name}" updated successfully!`));
  } catch (e) { res.send('Error: ' + e.message); }
});

app.get('/delete/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  try {
    if (usingMemory) {
      const i = memoryEmployees.findIndex(e => e.name === name);
      if (i === -1) return res.send('Employee not found.');
      memoryEmployees.splice(i, 1);
    } else {
      await Employee.findOneAndDelete({ name });
    }
    res.send(listPage(await getAll(), `Employee "${name}" deleted successfully!`));
  } catch (e) { res.send('Error: ' + e.message); }
});

app.listen(3000, () => console.log('Server running at http://localhost:3000/employees'));
