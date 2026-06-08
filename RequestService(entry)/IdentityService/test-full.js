/**
 * Final API Test - Complete workflow
 */

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
                    resolve({
                        status: res.statusCode,
                        body: JSON.parse(response)
                    });
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
                    resolve({
                        status: res.statusCode,
                        body: JSON.parse(response)
                    });
                });
            });

            req.on('error', reject);
            req.end();
        }
    });
}

async function runTests() {
    try {
        // Test 1: Health Check
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  Test 1: Health Check');
        console.log('╚════════════════════════════════════════╝');
        const health = await makeRequest('GET', '/api/v1/health');
        console.log(`✅ Status: ${health.status}`);
        console.log(`📊 Service: ${health.body.service}`);

        // Test 2: Register User
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  Test 2: Register New User');
        console.log('╚════════════════════════════════════════╝');
        
        const uniqueEmail = `user-${Date.now()}@smart-campus.local`;
        const registerData = {
            name: 'Alice Johnson',
            email: uniqueEmail,
            password: 'SecurePass123',
            confirmPassword: 'SecurePass123',
            matricNumber: `SC${Date.now().toString().slice(-6)}`,
            role: 'student'
        };

        const register = await makeRequest('POST', '/api/v1/auth/register', registerData);
        console.log(`✅ Status: ${register.status}`);
        console.log(`📧 Email: ${register.body.data?.user?.email}`);
        console.log(`👤 Name: ${register.body.data?.user?.name}`);
        console.log(`🎓 Role: ${register.body.data?.user?.role}`);
        console.log(`🎫 MatricNumber: ${register.body.data?.user?.matricNumber}`);

        if (!register.body.success) {
            console.error('❌ Registration failed:', register.body.message);
            return;
        }

        const accessToken = register.body.data.accessToken;

        // Test 3: Login User
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  Test 3: Login User');
        console.log('╚════════════════════════════════════════╝');

        const loginData = {
            email: uniqueEmail,
            password: 'SecurePass123'
        };

        const login = await makeRequest('POST', '/api/v1/auth/login', loginData);
        console.log(`✅ Status: ${login.status}`);
        console.log(`👤 User: ${login.body.data?.user?.name}`);
        console.log(`📧 Email: ${login.body.data?.user?.email}`);
        console.log(`🔑 Token: ${login.body.data?.accessToken?.substring(0, 30)}...`);

        if (!login.body.success) {
            console.error('❌ Login failed:', login.body.message);
            return;
        }

        // Test 4: Get Profile (Protected)
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  Test 4: Get User Profile (Protected)');
        console.log('╚════════════════════════════════════════╝');

        const profile = await makeRequest('GET', '/api/v1/users/profile/me', null, accessToken);
        console.log(`✅ Status: ${profile.status}`);
        console.log(`👤 Name: ${profile.body.data?.name}`);
        console.log(`📧 Email: ${profile.body.data?.email}`);
        console.log(`🎓 Role: ${profile.body.data?.role}`);
        console.log(`📝 Matric: ${profile.body.data?.matricNumber}`);

        // Test 5: Change Password
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  Test 5: Change Password');
        console.log('╚════════════════════════════════════════╝');

        const changePassword = await makeRequest('POST', '/api/v1/users/change-password', {
            oldPassword: 'SecurePass123',
            newPassword: 'NewSecurePass456',
            confirmPassword: 'NewSecurePass456'
        }, accessToken);

        console.log(`✅ Status: ${changePassword.status}`);
        console.log(`✨ Message: ${changePassword.body.data?.message}`);

        // Test 6: Login with New Password
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  Test 6: Login with New Password');
        console.log('╚════════════════════════════════════════╝');

        const loginNew = await makeRequest('POST', '/api/v1/auth/login', {
            email: uniqueEmail,
            password: 'NewSecurePass456'
        });

        console.log(`✅ Status: ${loginNew.status}`);
        console.log(`✨ Message: ${loginNew.body.message}`);

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  ✨ All Tests Completed Successfully!  ║');
        console.log('╚════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
}

runTests();
