const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {

    // API ROUTE
    if (req.url === "/api") {

        fs.readFile("data.json", "utf8", (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("Error reading file");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"   // ✅ IMPORTANT
            });

            res.end(data);
        });
    }

    // DEFAULT ROUTE
    else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Server is running...");
    }

});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));