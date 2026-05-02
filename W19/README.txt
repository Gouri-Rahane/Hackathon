Step-by-Step Guide to Install Requirements and Run the Student Marks CRUD App

This is a Node.js application using Express.js for the backend and MongoDB for data storage (with in-memory array fallback if MongoDB is not available).

Prerequisites:
- Node.js (version 14 or higher) - Download from https://nodejs.org/
- npm (comes with Node.js)
- MongoDB (optional, for persistent data storage) - Download from https://www.mongodb.com/

Installation and Setup Steps:

1. Download or Clone the Project:
   - Download the project files to your local machine, or clone the repository if it's hosted on GitHub.

2. Navigate to the Project Directory:
   - Open a terminal (Command Prompt, PowerShell, or any terminal emulator).
   - Change to the project directory: cd path/to/hackethon_19

3. Install Dependencies:
   - Run the following command to install the required Node.js packages:
     npm install
   - This will install Express.js and Mongoose based on the package.json file.

4. (Optional) Set Up MongoDB:
   - If you want persistent data storage, install and start MongoDB.
   - Ensure MongoDB is running on the default port (27017).
   - If MongoDB is not available, the app will automatically use an in-memory array for data storage.

5. Run the Application:
   - Start the server by running:
     npm start
   - You should see a message indicating the server is running.

6. Access the Application:
   - Open your web browser and go to: http://localhost:3000
   - The Student Marks CRUD app should now be running, allowing you to view, add, update, and delete student records.

Troubleshooting:
- If you encounter any errors during npm install, ensure Node.js and npm are properly installed.
- If the app doesn't start, check that port 3000 is not in use by another application.
- For MongoDB issues, verify that MongoDB is installed and running.

Enjoy using the Student Marks CRUD App!