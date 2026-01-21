const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
});

async function checkStatus() {
  try {
    console.log('🔍 X API アカウント情報を取得中...\n');
    
    // 自分のユーザー情報を取得（v2 API）
    const me = await client.v2.me();
    console.log('✅ 認証成功');
    console.log('📝 ユーザー名:', me.data.username);
    console.log('📝 ユーザーID:', me.data.id);
    console.log('📝 名前:', me.data.name);
    
  } catch (error) {
    console.error('❌ エラー:', error.code, error.message);
    if (error.data) {
      console.error('\n📄 詳細:');
      console.error('  Title:', error.data.title);
      console.error('  Detail:', error.data.detail);
      console.error('  Type:', error.data.type);
      if (error.data.account_id) {
        console.error('  Account ID:', error.data.account_id);
      }
    }
  }
}

checkStatus();
