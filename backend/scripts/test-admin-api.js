const http = require('http');

// Test the admin medical records API endpoint
function testAdminAPI() {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/medical-records',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Note: This will fail without proper authentication, but we can see if the endpoint exists
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response body:');
            try {
                const jsonData = JSON.parse(data);
                console.log(JSON.stringify(jsonData, null, 2));
            } catch (e) {
                console.log(data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.end();
}

console.log('Testing admin medical records API endpoint...');
testAdminAPI(); 