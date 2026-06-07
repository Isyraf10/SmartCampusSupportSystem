/**
 * Simple API Test Script - with unique email
 */

const http = require('http');

// Test 1: Health Check
console.log('\n=== Test 1: Health Check ===');
http.get('http://localhost:5000/api/v1/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        testRegister();
    });
});

// Test 2: Register User
function testRegister() {
    console.log('\n=== Test 2: Register User ===');
    
    const uniqueEmail = `user-${Date.now()}@example.com`;
    
    const data = JSON.stringify({
        name: 'Test User',
        email: uniqueEmail,
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        matricNumber: 'AB987654',
        role: 'student'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            const response = JSON.parse(responseData);
            console.log('Email:', response.data?.user?.email);
            console.log('Name:', response.data?.user?.name);
            console.log('Role:', response.data?.user?.role);
            console.log('Token received:', !!response.data?.accessToken);
            
            if (response.success) {
                testLogin(uniqueEmail);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Error:', e.message);
    });

    req.write(data);
    req.end();
}

// Test 3: Login User
function testLogin(email) {
    console.log('\n=== Test 3: Login User ===');
    
    const data = JSON.stringify({
        email: email,
        password: 'SecurePass123'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
            console.log('✅ Status:', res.statusCode);
            const response = JSON.parse(responseData);
            
            if (!response.success) {
                console.log('❌ Error:', response.message);
                return;
            }
            
            console.log('👤 User:', response.data?.user?.name);
            console.log('📧 Email:', response.data?.user?.email);
            console.log('🎓 Role:', response.data?.user?.role);
            console.log('🔑 Access Token:', response.data?.accessToken?.substring(0, 30) + '...');
            
            if (response.data?.accessToken) {
                testGetProfile(response.data.accessToken);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Error:', e.message);
    });

    req.write(data);
    req.end();
}

// Test 4: Get User Profile
function testGetProfile(token) {
    console.log('\n=== Test 4: Get User Profile (Protected) ===');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/users/profile/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('✅ Status:', res.statusCode);
            const response = JSON.parse(data);
            
            if (!response.success) {
                console.log('❌ Error:', response.message);
                return;
            }
            
            console.log('👤 Name:', response.data?.name);
            console.log('📧 Email:', response.data?.email);
            console.log('🎓 Role:', response.data?.role);
            console.log('🎓 Matric:', response.data?.matricNumber);
            console.log('\n✨ All tests completed successfully!');
        });
    });

    req.on('error', (e) => {
        console.error('❌ Error:', e.message);
    });

    req.end();
}
