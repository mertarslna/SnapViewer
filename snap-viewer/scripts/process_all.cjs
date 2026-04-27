const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootPath = path.join(__dirname, '../..');
const publicDataPath = path.join(__dirname, '../public/data');

// Create public/data if not exists
if (!fs.existsSync(publicDataPath)) {
    fs.mkdirSync(publicDataPath, { recursive: true });
}

console.log('--- Veri İşleme Başlatıldı ---');

// 1. Instagram İşleme
const instagramSource = path.join(rootPath, 'instagramdata');
if (fs.existsSync(instagramSource)) {
    console.log('[Instagram] Veriler işleniyor...');
    try {
        execSync('node scripts/process_instagram.cjs', { stdio: 'inherit' });
        console.log('[Instagram] Başarıyla tamamlandı.');
    } catch (e) {
        console.error('[Instagram] Hata oluştu:', e.message);
    }
} else {
    console.log('[Instagram] "instagramdata" klasörü bulunamadı, atlanıyor.');
}

// 2. Snapchat İşleme (Kopyalama)
const snapSource = path.join(rootPath, 'mydata/json');
const snapFiles = ['chat_history.json', 'friends.json'];

if (fs.existsSync(snapSource)) {
    console.log('[Snapchat] Veriler kopyalanıyor...');
    snapFiles.forEach(file => {
        const src = path.join(snapSource, file);
        const dest = path.join(publicDataPath, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`[Snapchat] ${file} kopyalandı.`);
        } else {
            console.log(`[Snapchat] Uyarı: ${file} bulunamadı.`);
        }
    });
} else {
    console.log('[Snapchat] "mydata/json" klasörü bulunamadı, atlanıyor.');
}

console.log('\n--- Tüm İşlemler Tamamlandı ---');
console.log('Uygulamayı yenileyerek verileri görebilirsiniz.');
