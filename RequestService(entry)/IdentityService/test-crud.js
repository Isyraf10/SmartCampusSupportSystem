/**
 * CRUD Operation Test - Identify database update issues
 */

require('dotenv').config();
const http = require('http');

function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            const body = JSON.stringify(data);
            options.headers['Content-Length'] = body.length;
            
            const req = http.request(options, (res) => {
                let response = '';
                res.on('data', chunk => response += chunk);
                res.on('end', () => {
                    try {
                        resolve({
                            status: res.statusCode,
                            body: JSON.parse(response)
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            body: response
                        });
                    }
                });
            });

            req.on('error', reject);
            req.write(body);
            req.end();
        } else {
            const req = http.request(options, (res) => {
                let response = '';
                res.on('data', chunk => response += chunk);
                res.on('end', () => {
                    try {
                        resolve({
                            status: res.statusCode,
                            body: JSON.parse(response)
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            body: response
                        });
                    }
                });
            });

            req.on('error', reject);
            req.end();
        }
    });
}

async function runTests() {
    try {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  CRUD OPERATION TEST - Database Update Issues');
        console.log('═══════════════════════════════════════════════════════\n');

        // Step 1: Register User
        console.log('📝 Step 1: Register User');
        const uniqueEmail = `user-${Date.now()}@test.com`;
        const matric = `S${Date.now().toString().slice(-5)}`; // Format: S + 5 digits
        
        const registerData = {
            name: 'Test User',
            email: uniqueEmail,
            password: 'SecurePass123',
            confirmPassword: 'SecurePass123',
            matricNumber: matric,
            role: 'student'
        };

        const register = await makeRequest('POST', '/api/v1/auth/register', registerData);
        console.log(`  Status: ${register.status}`);
        console.log(`  User ID: ${register.body.data?.user?.id}`);
        console.log(`  Email: ${register.body.data?.user?.email}`);
        console.log(`  MatricNumber: ${register.body.data?.user?.matricNumber}`);

        if (!register.body.success) {
            console.error('  ❌ Registration failed:', register.body.message);
            return;
        }

        const userId = register.body.data?.user?.id;
        const accessToken = register.body.data.accessToken;

        // Step 2: Get Profile Before Update
        console.log('\n📖 Step 2: Get Profile Before Update');
        const profileBefore = await makeRequest('GET', '/api/v1/users/profile/me', null, accessToken);
        console.log(`  Status: ${profileBefore.status}`);
        console.log(`  Name: ${profileBefore.body.data?.name}`);
        console.log(`  Email: ${profileBefore.body.data?.email}`);
        console.log(`  MatricNumber: ${profileBefore.body.data?.matricNumber}`);

        // Step 3: Update User Profile
        console.log('\n✏️ Step 3: Update User Profile');
        const updateData = {
            name: 'Updated User Name',
            matricNumber: 'S99999',
            role: 'student'
        };

        const update = await makeRequest('PUT', `/api/v1/users/${userId}`, updateData, accessToken);
        console.log(`  Status: ${update.status}`);
        console.log(`  Response:`, JSON.stringify(update.body, null, 2));

        if (!update.body.success) {
            console.error('  ❌ Update failed:', update.body.message);
        } else {
            console.log(`  ✅ Updated Name: ${update.body.data?.name}`);
            console.log(`  ✅ Updated MatricNumber: ${update.body.data?.matricNumber}`);
        }

        // Step 4: Get Profile After Update
        console.log('\n📖 Step 4: Get Profile After Update (Verify Changes)');
        const profileAfter = await makeRequest('GET', '/api/v1/users/profile/me', null, accessToken);
        console.log(`  Status: ${profileAfter.status}`);
        console.log(`  Name: ${profileAfter.body.data?.name}`);
        console.log(`  Email: ${profileAfter.body.data?.email}`);
        console.log(`  MatricNumber: ${profileAfter.body.data?.matricNumber}`);

        if (profileAfter.body.data?.name === updateData.name) {
            console.log('  ✅ Name was updated successfully!');
        } else {
            console.log('  ❌ Name was NOT updated in database!');
        }

        if (profileAfter.body.data?.matricNumber === updateData.matricNumber) {
            console.log('  ✅ MatricNumber was updated successfully!');
        } else {
            console.log('  ❌ MatricNumber was NOT updated in database!');
        }

        // Step 5: Test Partial Update (only name)
        console.log('\n✏️ Step 5: Test Partial Update (name only)');
        const partialUpdate = await makeRequest('PUT', `/api/v1/users/${userId}`, 
            { name: 'Partial Update Name' }, 
            accessToken
        );
        console.log(`  Status: ${partialUpdate.status}`);
        if (partialUpdate.body.success) {
            console.log(`  Updated Name: ${partialUpdate.body.data?.name}`);
        } else {
            console.log(`  Error: ${partialUpdate.body.message}`);
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  Test Completed');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        console.error(error.stack);
    }

    process.exit(0);
}

runTests();
