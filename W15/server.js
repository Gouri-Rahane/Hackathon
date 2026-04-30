const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {

    if (req.url === "/products") {

        fs.readFile("products.json", "utf8", (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("Error loading products");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"   // IMPORTANT
            });

            res.end(data);
        });

    } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Server Running...");
    }

});

server.listen(3000, () => console.log("Server running at http://localhost:3000"));