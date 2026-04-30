const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {

    let file = "index.html";

    if (req.url === "/about") {
        file = "about.html";
    }
    else if (req.url === "/contact") {
        file = "contact.html";
    }

    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("<h1>404 Page Not Found</h1>");
        } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        }
    });

});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});