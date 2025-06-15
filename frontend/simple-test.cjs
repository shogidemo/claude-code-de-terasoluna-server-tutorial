const { chromium } = require('playwright');

(async () => {
  console.log('🚀 React TODO アプリの簡易動作確認');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://127.0.0.1:3001');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ アプリケーションの読み込み完了');
    
    // TODO追加
    await page.fill('input[placeholder="TODOを入力してください"]', 'テスト用TODO');
    await page.click('button:has-text("追加")');
    await page.waitForTimeout(1000);
    
    console.log('✅ TODO追加テスト完了');
    
    // スクリーンショット撮影
    await page.screenshot({ path: 'final-test-result.png', fullPage: true });
    console.log('✅ スクリーンショット保存: final-test-result.png');
    
    // 5秒間表示を維持
    console.log('📱 5秒間ブラウザを表示します...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await browser.close();
  }
})();