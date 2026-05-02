// =============================================
// Employee Management System
// Backend using Node.js, Express.js, MongoDB
// =============================================

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -----------------------------------------------
// FALLBACK: In-memory array (used if MongoDB is down)
// -----------------------------------------------
let usingMemory = false;
let memoryEmployees = [];
let nextId = 1;

// -----------------------------------------------
// MongoDB Connection
// -----------------------------------------------
mongoose.connect('mongodb://127.0.0.1:27017/company')
  .then(() => {
    console.log('Connected to MongoDB successfully');
    usingMemory = false;
  })
  .catch((err) => {
    console.log('MongoDB not available. Using in-memory array as fallback.');
    console.log('Error:', err.message);
    usingMemory = true;
  });

// -----------------------------------------------
// Mongoose Schema and Model
// -----------------------------------------------
const employeeSchema = new mongoose.Schema({
  name: String,
  department: String,
  designation: String,
  salary: Number,
  joining_date: String
});

const Employee = mongoose.model('Employee', employeeSchema, 'employees');

// -----------------------------------------------
// Shared CSS styles used across all pages
// -----------------------------------------------
function getStyles() {
  return `
    <style>
      /* Reset and base */
      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f0f2f5;
        color: #333;
        min-height: 100vh;
      }

      /* Top navbar */
      .navbar {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        padding: 0 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 65px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }

      .navbar .brand {
        color: #fff;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .navbar .brand span {
        color: #4ecca3;
      }

      .navbar .nav-links {
        display: flex;
        gap: 10px;
      }

      .navbar .nav-links a {
        color: #ccc;
        text-decoration: none;
        padding: 8px 18px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .navbar .nav-links a:hover {
        background: rgba(78, 204, 163, 0.15);
        color: #4ecca3;
      }

      .navbar .nav-links a.active {
        background: #4ecca3;
        color: #1a1a2e;
        font-weight: 700;
      }

      /* Page wrapper */
      .page {
        max-width: 1100px;
        margin: 40px auto;
        padding: 0 20px;
      }

      /* Page header */
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 25px;
      }

      .page-header h1 {
        font-size: 26px;
        color: #1a1a2e;
        font-weight: 700;
      }

      .page-header p {
        color: #888;
        font-size: 14px;
        margin-top: 4px;
      }

      /* Mode badge */
      .mode-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .mode-badge.mongo {
        background: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #a5d6a7;
      }

      .mode-badge.memory {
        background: #fff3e0;
        color: #e65100;
        border: 1px solid #ffcc80;
      }

      .mode-badge .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }

      .mode-badge.mongo .dot { background: #4caf50; }
      .mode-badge.memory .dot { background: #ff9800; }

      /* Alert / success message */
      .alert {
        padding: 14px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .alert.success {
        background: #e8f5e9;
        color: #2e7d32;
        border-left: 4px solid #4caf50;
      }

      .alert.error {
        background: #ffebee;
        color: #c62828;
        border-left: 4px solid #ef5350;
      }

      /* Card container */
      .card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        overflow: hidden;
      }

      .card-header {
        padding: 18px 25px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-header h2 {
        font-size: 16px;
        color: #1a1a2e;
        font-weight: 600;
      }

      .card-header .count {
        background: #f0f2f5;
        color: #555;
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
      }

      /* Table */
      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead tr {
        background: #f8f9fa;
      }

      thead th {
        padding: 14px 20px;
        text-align: left;
        font-size: 12px;
        font-weight: 700;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        border-bottom: 2px solid #f0f0f0;
      }

      tbody tr {
        border-bottom: 1px solid #f5f5f5;
        transition: background 0.15s;
      }

      tbody tr:hover {
        background: #fafbff;
      }

      tbody td {
        padding: 15px 20px;
        font-size: 14px;
        color: #444;
      }

      /* Avatar circle for name */
      .name-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4ecca3, #1a1a2e);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .name-text {
        font-weight: 600;
        color: #1a1a2e;
      }

      /* Department badge */
      .dept-badge {
        background: #e8eaf6;
        color: #3949ab;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      /* Salary */
      .salary {
        font-weight: 700;
        color: #2e7d32;
      }

      /* Action buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }

      .btn-edit {
        background: #e3f2fd;
        color: #1565c0;
      }

      .btn-edit:hover {
        background: #1565c0;
        color: #fff;
      }

      .btn-delete {
        background: #ffebee;
        color: #c62828;
      }

      .btn-delete:hover {
        background: #c62828;
        color: #fff;
      }

      .btn-primary {
        background: linear-gradient(135deg, #4ecca3, #38b28e);
        color: #1a1a2e;
        padding: 10px 22px;
        font-size: 14px;
        border-radius: 8px;
        font-weight: 700;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
        box-shadow: 0 3px 10px rgba(78,204,163,0.3);
      }

      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 5px 15px rgba(78,204,163,0.4);
      }

      /* Empty state */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #aaa;
      }

      .empty-state .icon {
        font-size: 50px;
        margin-bottom: 15px;
      }

      .empty-state h3 {
        font-size: 18px;
        color: #888;
        margin-bottom: 8px;
      }

      .empty-state p {
        font-size: 14px;
        margin-bottom: 20px;
      }

      /* Form page */
      .form-page {
        max-width: 560px;
        margin: 40px auto;
        padding: 0 20px;
      }

      .form-card {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        overflow: hidden;
      }

      .form-card-header {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        padding: 25px 30px;
        color: #fff;
      }

      .form-card-header h2 {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .form-card-header p {
        color: #aaa;
        font-size: 13px;
      }

      .form-body {
        padding: 30px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #555;
        margin-bottom: 7px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-group input {
        width: 100%;
        padding: 11px 15px;
        border: 2px solid #e8e8e8;
        border-radius: 8px;
        font-size: 14px;
        color: #333;
        transition: border-color 0.2s, box-shadow 0.2s;
        outline: none;
        background: #fafafa;
      }

      .form-group input:focus {
        border-color: #4ecca3;
        box-shadow: 0 0 0 3px rgba(78,204,163,0.15);
        background: #fff;
      }

      .form-group input[readonly] {
        background: #f0f0f0;
        color: #888;
        cursor: not-allowed;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      .form-footer {
        padding: 20px 30px;
        background: #f8f9fa;
        border-top: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .btn-submit {
        background: linear-gradient(135deg, #4ecca3, #38b28e);
        color: #1a1a2e;
        padding: 11px 28px;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 3px 10px rgba(78,204,163,0.3);
      }

      .btn-submit:hover {
        transform: translateY(-1px);
        box-shadow: 0 5px 15px rgba(78,204,163,0.4);
      }

      .btn-back {
        color: #888;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: color 0.2s;
      }

      .btn-back:hover { color: #333; }

      /* Stats row */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-bottom: 25px;
      }

      .stat-card {
        background: #fff;
        border-radius: 10px;
        padding: 18px 22px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        border-left: 4px solid #4ecca3;
      }

      .stat-card.orange { border-left-color: #ff9800; }
      .stat-card.blue   { border-left-color: #2196f3; }

      .stat-card .stat-label {
        font-size: 12px;
        color: #999;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }

      .stat-card .stat-value {
        font-size: 26px;
        font-weight: 800;
        color: #1a1a2e;
      }

      /* Responsive */
      @media (max-width: 700px) {
        .stats-row { grid-template-columns: 1fr; }
        .form-row  { grid-template-columns: 1fr; }
        .navbar    { padding: 0 15px; }
        .page      { padding: 0 10px; }
      }
    </style>
  `;
}

// -----------------------------------------------
// Helper: Navbar HTML
// -----------------------------------------------
function getNavbar(activePage) {
  let modeBadge = usingMemory
    ? `<span class="mode-badge memory"><span class="dot"></span> In-Memory Mode</span>`
    : `<span class="mode-badge mongo"><span class="dot"></span> MongoDB Connected</span>`;

  return `
    <nav class="navbar">
      <div class="brand">
        &#128188; <span>EMS</span> &nbsp;Employee Management
      </div>
      <div style="display:flex; align-items:center; gap:20px;">
        ${modeBadge}
        <div class="nav-links">
          <a href="/employees" class="${activePage === 'list' ? 'active' : ''}">&#128101; Employees</a>
          <a href="/add" class="${activePage === 'add' ? 'active' : ''}">&#43; Add Employee</a>
        </div>
      </div>
    </nav>
  `;
}

// -----------------------------------------------
// Helper: Build the employees list page
// -----------------------------------------------
function buildTable(employees, message) {
  // Calculate some stats
  let total = employees ? employees.length : 0;
  let totalSalary = 0;
  let deptSet = new Set();
  if (employees) {
    for (let e of employees) {
      totalSalary += Number(e.salary) || 0;
      if (e.department) deptSet.add(e.department);
    }
  }
  let avgSalary = total > 0 ? Math.round(totalSalary / total) : 0;

  // Alert message block
  let alertHtml = '';
  if (message) {
    alertHtml = `<div class="alert success">&#10003; ${message}</div>`;
  }

  // Stats row
  let statsHtml = `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Total Employees</div>
        <div class="stat-value">${total}</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-label">Departments</div>
        <div class="stat-value">${deptSet.size}</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">Avg. Salary</div>
        <div class="stat-value">&#8377;${avgSalary.toLocaleString()}</div>
      </div>
    </div>
  `;

  // Table or empty state
  let tableHtml = '';
  if (!employees || employees.length === 0) {
    tableHtml = `
      <div class="card">
        <div class="empty-state">
          <div class="icon">&#128101;</div>
          <h3>No Employees Found</h3>
          <p>Start by adding your first employee to the system.</p>
          <a href="/add" class="btn-primary">&#43; Add First Employee</a>
        </div>
      </div>
    `;
  } else {
    // Build rows
    let rows = '';
    for (let i = 0; i < employees.length; i++) {
      let emp = employees[i];
      // Get first letter of name for avatar
      let initial = emp.name ? emp.name.charAt(0).toUpperCase() : '?';
      // Format salary with commas
      let salaryFormatted = Number(emp.salary).toLocaleString();
      rows += `
        <tr>
          <td>
            <div class="name-cell">
              <div class="avatar">${initial}</div>
              <span class="name-text">${emp.name}</span>
            </div>
          </td>
          <td><span class="dept-badge">${emp.department}</span></td>
          <td>${emp.designation}</td>
          <td><span class="salary">&#8377;${salaryFormatted}</span></td>
          <td>${emp.joining_date}</td>
          <td>
            <div style="display:flex; gap:8px;">
              <a href="/edit/${emp.name}" class="btn btn-edit">&#9998; Edit</a>
              <a href="/delete/${emp.name}" class="btn btn-delete"
                onclick="return confirm('Are you sure you want to delete ${emp.name}?')">
                &#128465; Delete
              </a>
            </div>
          </td>
        </tr>
      `;
    }

    tableHtml = `
      <div class="card">
        <div class="card-header">
          <h2>All Employees</h2>
          <span class="count">${total} records</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Salary</th>
              <th>Joining Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Full page
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Employees - EMS</title>
      ${getStyles()}
    </head>
    <body>
      ${getNavbar('list')}
      <div class="page">
        <div class="page-header">
          <div>
            <h1>Employee Records</h1>
            <p>Manage all employee information in one place</p>
          </div>
          <a href="/add" class="btn-primary">&#43; Add Employee</a>
        </div>
        ${alertHtml}
        ${statsHtml}
        ${tableHtml}
      </div>
    </body>
    </html>
  `;

  return html;
}

// -----------------------------------------------
// Helper: Build Add / Edit form page
// -----------------------------------------------
function buildForm(emp, isEdit) {
  let name       = emp ? emp.name        : '';
  let dept       = emp ? emp.department  : '';
  let desig      = emp ? emp.designation : '';
  let sal        = emp ? emp.salary      : '';
  let date       = emp ? emp.joining_date : '';

  let title      = isEdit ? 'Update Employee' : 'Add New Employee';
  let subtitle   = isEdit ? `Editing record for ${name}` : 'Fill in the details below';
  let action     = isEdit ? `/update/${name}` : '/add';
  let btnLabel   = isEdit ? '&#10003; Save Changes' : '&#43; Add Employee';

  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title} - EMS</title>
      ${getStyles()}
    </head>
    <body>
      ${getNavbar(isEdit ? '' : 'add')}
      <div class="form-page">
        <div style="margin: 20px 0 15px;">
          <a href="/employees" class="btn-back">&#8592; Back to Employee List</a>
        </div>
        <div class="form-card">
          <div class="form-card-header">
            <h2>${title}</h2>
            <p>${subtitle}</p>
          </div>
          <form method="POST" action="${action}">
            <div class="form-body">

              <div class="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value="${name}"
                  placeholder="e.g. Rahul Sharma"
                  ${isEdit ? 'readonly' : 'required'}
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value="${dept}"
                    placeholder="e.g. Engineering"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value="${desig}"
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Salary (&#8377;)</label>
                  <input
                    type="number"
                    name="salary"
                    value="${sal}"
                    placeholder="e.g. 50000"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    name="joining_date"
                    value="${date}"
                    required
                  />
                </div>
              </div>

            </div>
            <div class="form-footer">
              <a href="/employees" class="btn-back">&#10005; Cancel</a>
              <button type="submit" class="btn-submit">${btnLabel}</button>
            </div>
          </form>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

// ===============================================
// ROUTES
// ===============================================

// Home - redirect to employees list
app.get('/', (req, res) => {
  res.redirect('/employees');
});

// -----------------------------------------------
// GET /employees - View all employees
// -----------------------------------------------
app.get('/employees', async (req, res) => {
  try {
    if (usingMemory) {
      let html = buildTable(memoryEmployees, '');
      res.send(html);
    } else {
      let allEmployees = await Employee.find();
      let html = buildTable(allEmployees, '');
      res.send(html);
    }
  } catch (err) {
    res.send('Error fetching employees: ' + err.message);
  }
});

// -----------------------------------------------
// GET /add - Show Add Employee form
// -----------------------------------------------
app.get('/add', (req, res) => {
  let html = buildForm(null, false);
  res.send(html);
});

// -----------------------------------------------
// POST /add - Save new employee
// -----------------------------------------------
app.post('/add', async (req, res) => {
  let name        = req.body.name;
  let department  = req.body.department;
  let designation = req.body.designation;
  let salary      = req.body.salary;
  let joining_date = req.body.joining_date;

  try {
    if (usingMemory) {
      // Add to in-memory array
      let newEmp = {
        id: nextId++,
        name: name,
        department: department,
        designation: designation,
        salary: salary,
        joining_date: joining_date
      };
      memoryEmployees.push(newEmp);
      let html = buildTable(memoryEmployees, `Employee "${name}" added successfully!`);
      res.send(html);
    } else {
      // Save to MongoDB
      let newEmp = new Employee({
        name: name,
        department: department,
        designation: designation,
        salary: salary,
        joining_date: joining_date
      });
      await newEmp.save();
      let allEmployees = await Employee.find();
      let html = buildTable(allEmployees, `Employee "${name}" added successfully!`);
      res.send(html);
    }
  } catch (err) {
    res.send('Error adding employee: ' + err.message);
  }
});

// -----------------------------------------------
// GET /edit/:name - Show pre-filled edit form
// -----------------------------------------------
app.get('/edit/:name', async (req, res) => {
  let empName = req.params.name;

  try {
    if (usingMemory) {
      let emp = memoryEmployees.find(e => e.name === empName);
      if (!emp) { res.send('Employee not found.'); return; }
      let html = buildForm(emp, true);
      res.send(html);
    } else {
      let emp = await Employee.findOne({ name: empName });
      if (!emp) { res.send('Employee not found.'); return; }
      let html = buildForm(emp, true);
      res.send(html);
    }
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// -----------------------------------------------
// POST /update/:name - Update employee details
// -----------------------------------------------
app.post('/update/:name', async (req, res) => {
  let empName = req.params.name;

  let updatedData = {
    department:  req.body.department,
    designation: req.body.designation,
    salary:      req.body.salary,
    joining_date: req.body.joining_date
  };

  try {
    if (usingMemory) {
      let index = memoryEmployees.findIndex(e => e.name === empName);
      if (index === -1) { res.send('Employee not found.'); return; }
      // Update fields
      memoryEmployees[index].department  = updatedData.department;
      memoryEmployees[index].designation = updatedData.designation;
      memoryEmployees[index].salary      = updatedData.salary;
      memoryEmployees[index].joining_date = updatedData.joining_date;
      let html = buildTable(memoryEmployees, `Employee "${empName}" updated successfully!`);
      res.send(html);
    } else {
      await Employee.findOneAndUpdate({ name: empName }, updatedData);
      let allEmployees = await Employee.find();
      let html = buildTable(allEmployees, `Employee "${empName}" updated successfully!`);
      res.send(html);
    }
  } catch (err) {
    res.send('Error updating employee: ' + err.message);
  }
});

// -----------------------------------------------
// GET /delete/:name - Delete employee by name
// -----------------------------------------------
app.get('/delete/:name', async (req, res) => {
  let empName = req.params.name;

  try {
    if (usingMemory) {
      let index = memoryEmployees.findIndex(e => e.name === empName);
      if (index === -1) { res.send('Employee not found.'); return; }
      memoryEmployees.splice(index, 1);
      let html = buildTable(memoryEmployees, `Employee "${empName}" deleted successfully!`);
      res.send(html);
    } else {
      await Employee.findOneAndDelete({ name: empName });
      let allEmployees = await Employee.find();
      let html = buildTable(allEmployees, `Employee "${empName}" deleted successfully!`);
      res.send(html);
    }
  } catch (err) {
    res.send('Error deleting employee: ' + err.message);
  }
});

// -----------------------------------------------
// Start the server
// -----------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open browser: http://localhost:${PORT}/employees`);
});
