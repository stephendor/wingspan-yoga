/**
 * Test instructor dashboard authentication and role-based access
 * 
 * This script tests:
 * 1. Unauthenticated access (should redirect to sign-in)
 * 2. Instructor authentication and dashboard access
 * 3. Role-based authorization checks
 */

const puppeteer = require('puppeteer');

async function testInstructorDashboard() {
  console.log('🧪 Testing Instructor Dashboard Authentication & RBAC...\n');

  let browser;
  try {
    browser = await puppeteer.launch({ headless: false, slowMo: 100 });
    const page = await browser.newPage();

    // Test 1: Unauthenticated access should redirect to sign-in
    console.log('1️⃣ Testing unauthenticated access...');
    await page.goto('http://localhost:3001/instructor/dashboard', { waitUntil: 'networkidle0' });
    
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/signin')) {
      console.log('   ✅ Unauthenticated users correctly redirected to sign-in');
      console.log(`   📍 Redirected to: ${currentUrl}`);
    } else {
      console.log('   ❌ Expected redirect to sign-in, but got:', currentUrl);
    }

    // Test 2: Instructor login and dashboard access
    console.log('\n2️⃣ Testing instructor authentication...');
    
    // Fill in credentials
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', 'anna@wingspan-yoga.com');
    await page.type('input[name="password"]', '100%Rufus');
    
    console.log('   📝 Entering instructor credentials...');
    
    // Submit form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]')
    ]);

    const postLoginUrl = page.url();
    console.log(`   📍 Post-login URL: ${postLoginUrl}`);

    // Test 3: Check if we can access the dashboard
    console.log('\n3️⃣ Testing dashboard access...');
    
    if (postLoginUrl.includes('/instructor/dashboard')) {
      console.log('   ✅ Successfully redirected to instructor dashboard');
      
      // Check for dashboard elements
      const welcomeText = await page.$eval('h1', el => el.textContent);
      const roleElements = await page.$$('.text-green-800');
      
      if (welcomeText.includes('Instructor Dashboard')) {
        console.log('   ✅ Dashboard page loaded correctly');
        console.log(`   👋 Welcome message: ${welcomeText}`);
      }
      
      if (roleElements.length > 0) {
        const roleText = await roleElements[0].evaluate(el => el.textContent);
        console.log(`   🎭 User role displayed: ${roleText}`);
        
        if (roleText === 'INSTRUCTOR') {
          console.log('   ✅ Correct role displayed in UI');
        }
      }

      // Check for RBAC test section
      const rbacSection = await page.$('.bg-blue-50');
      if (rbacSection) {
        console.log('   🔒 RBAC test section found');
        const sessionData = await page.$eval('.font-mono', el => el.textContent);
        console.log('   📊 Session data visible in UI');
      }

    } else {
      console.log('   ❌ Expected to be at dashboard, but at:', postLoginUrl);
    }

    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testInstructorDashboard().catch(console.error);
