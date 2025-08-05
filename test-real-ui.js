const puppeteer = require('puppeteer');

async function testRealUI() {
  console.log('🧪 开始真实UI测试...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // 显示浏览器窗口
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // 1. 访问认知考古页面
    console.log('1️⃣ 访问认知考古页面...');
    await page.goto('http://localhost:3002/cognitive-archaeology');
    await page.waitForTimeout(2000);
    
    // 2. 输入文字
    console.log('2️⃣ 输入测试文字...');
    const textarea = await page.$('textarea');
    await textarea.type('我被公司裁员了，感觉很失落');
    
    // 3. 点击发送按钮
    console.log('3️⃣ 点击发送按钮...');
    const sendButton = await page.$('button:has(svg)');
    await sendButton.click();
    
    // 4. 等待响应
    console.log('4️⃣ 等待AI响应...');
    await page.waitForTimeout(3000);
    
    // 5. 检查是否有响应
    const messages = await page.$$('.rounded-lg.p-3');
    console.log(`✅ 找到 ${messages.length} 条消息`);
    
    // 6. 测试图片上传
    console.log('\n5️⃣ 测试图片上传...');
    const fileInput = await page.$('input[type="file"]');
    const cameraButton = await page.$('button:has(.w-4.h-4)');
    await cameraButton.click();
    
    console.log('\n✨ UI测试完成！');
    console.log('请手动检查页面是否正常工作。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
  
  // 保持浏览器打开
  console.log('\n按 Ctrl+C 关闭浏览器...');
}

// 检查是否安装了 puppeteer
try {
  require('puppeteer');
  testRealUI();
} catch (error) {
  console.log('⚠️ 需要安装 puppeteer:');
  console.log('npm install puppeteer');
  console.log('\n或者手动测试：');
  console.log('1. 打开 http://localhost:3002/cognitive-archaeology');
  console.log('2. 输入文字或上传图片');
  console.log('3. 点击发送按钮');
  console.log('4. 观察是否有响应');
}