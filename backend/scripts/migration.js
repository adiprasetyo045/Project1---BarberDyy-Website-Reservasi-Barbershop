const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const migrate = async () => {
    try {
        // Mencari folder database/migrations (naik 2 level dari backend/scripts)
        const migrationsDir = path.join(__dirname, '../../database/migrations');
        
        console.log('📂 Sedang membaca file migrasi dari:', migrationsDir);
        
        // Baca semua file .sql dan urutkan
        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (file.endsWith('.sql')) {
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                
                console.log(`⏳ Sedang mengeksekusi: ${file}`);
                await db.query(sql);
                console.log(`✅ Sukses: ${file}`);
            }
        }

        console.log('🎉 ALHAMDULILLAH! Semua tabel berhasil dibuat!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Gagal Migrasi:', err);
        process.exit(1);
    }
};

migrate();