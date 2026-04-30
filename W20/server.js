const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// 🔗 MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/employeesDB')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 🧱 Employee Schema
const employeeSchema = new mongoose.Schema({
    name: String,
    department: String,
    designation: String,
    salary: Number,
    joiningDate: String
});

// 📦 Model
const Employee = mongoose.model('Employee', employeeSchema);


// ➕ ADD EMPLOYEE
app.post('/add', async (req, res) => {
    try {
        const emp = new Employee(req.body);
        await emp.save();
        res.send("Employee Added Successfully");
    } catch (err) {
        res.send(err);
    }
});


// 📄 VIEW ALL EMPLOYEES
app.get('/view', async (req, res) => {
    const data = await Employee.find();
    res.json(data);
});


// ✏️ UPDATE EMPLOYEE
app.put('/update/:id', async (req, res) => {
    await Employee.findByIdAndUpdate(req.params.id, req.body);
    res.send("Employee Updated Successfully");
});


// ❌ DELETE EMPLOYEE
app.delete('/delete/:id', async (req, res) => {
    await Employee.findByIdAndDelete(req.params.id);
    res.send("Employee Deleted Successfully");
});


// 🚀 START SERVER
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});