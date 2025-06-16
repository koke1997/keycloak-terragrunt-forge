import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function testKeycloakConverter() {
  console.log('🚀 Starting Puppeteer test of Keycloak Converter...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📱 Navigating to http://localhost:8080/');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    console.log('📸 Screenshot saved: homepage.png');
    
    // Check if the page loaded correctly
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Look for key elements
    const uploadArea = await page.$('[data-testid="file-upload"], .file-upload, input[type="file"]');
    if (uploadArea) {
      console.log('✅ File upload area detected');
    } else {
      console.log('❌ File upload area not found');
    }
    
    // Get page content for analysis
    const pageText = await page.evaluate(() => document.body.innerText);
    
    const keywords = ['keycloak', 'terraform', 'upload', 'convert', 'realm'];
    const foundKeywords = keywords.filter(keyword => 
      pageText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    console.log(`🔍 Found keywords: ${foundKeywords.join(', ')}`);
    
    // Try to find and interact with file input
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      console.log('🎯 File input found, testing file upload...');
      
      // Upload the smallest test file
      const testFile = path.resolve('./test-samples/example-realm.json');
      await fileInput.uploadFiles(testFile);
      console.log('📤 File uploaded successfully');
      
      // Wait for processing
      await page.waitForTimeout(2000);
      
      // Take another screenshot
      await page.screenshot({ path: 'test-results/after-upload.png', fullPage: true });
      console.log('📸 Screenshot saved: after-upload.png');
      
      // Check for conversion results
      const resultsText = await page.evaluate(() => document.body.innerText);
      if (resultsText.includes('terraform') || resultsText.includes('main.tf')) {
        console.log('✅ Conversion results detected');
      } else {
        console.log('❌ No conversion results found');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-results/error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

// Create test results directory
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

testKeycloakConverter().catch(console.error);