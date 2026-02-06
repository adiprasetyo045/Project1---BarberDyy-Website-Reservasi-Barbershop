const db = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        console.log('🧹 Cleaning tables and resetting IDs...');
        // Membersihkan tabel lama agar ID reset dari 1
        await db.query('TRUNCATE TABLE bookings, barbers, services, users RESTART IDENTITY CASCADE');

        console.log('... Inserting Services (Complete Catalog with Images)');
        
        // PENTING: Pastikan file gambar (.jpg) di folder 'frontend/assets/images/' 
        // memiliki nama yang SAMA PERSIS dengan yang tertulis di bawah ini.
        
        await db.query(`
            INSERT INTO services (name, duration, price, description, image) VALUES 
            -- A. POTONGAN DASAR
            ('Buzz Cut', 20, 40000, 'Potongan Dasar. Perawatan: Rendah. Wajah: Oval/Kotak. Gaya militer super pendek.', 'assets/images/buz-cut.jpg'),
            ('Crew Cut', 25, 45000, 'Potongan Dasar. Perawatan: Rendah. Wajah: Bulat/Oval. Cepak rapi.', 'assets/images/crew-cut.jpg'),
            ('Clean Cut', 30, 50000, 'Potongan Dasar. Perawatan: Rendah. Wajah: Semua Tipe. Rapi dan formal.', 'assets/images/clean-cut.jpg'),
            ('Classic Cut', 35, 50000, 'Potongan Dasar. Perawatan: Sedang. Wajah: Oval/Lonjong. Gaya klasik abadi.', 'assets/images/classic-cut.jpg'),

            -- B. FADE HAIRCUT
            ('Low Fade', 40, 55000, 'Fade Haircut. Perawatan: Sedang. Wajah: Semua Tipe. Gradasi rendah.', 'assets/images/low-fade.jpg'),
            ('Mid Fade', 40, 55000, 'Fade Haircut. Perawatan: Sedang. Wajah: Semua Tipe. Gradasi tengah.', 'assets/images/mid-fade.jpg'),
            ('High Fade', 40, 55000, 'Fade Haircut. Perawatan: Sedang. Wajah: Kotak/Bulat. Gradasi tinggi.', 'assets/images/high-fade.jpg'),
            ('Skin Fade', 45, 60000, 'Fade Haircut. Perawatan: Tinggi. Wajah: Kotak/Oval. Gradasi dari kulit.', 'assets/images/skin-fade.jpg'),
            ('Drop Fade', 45, 60000, 'Fade Haircut. Perawatan: Tinggi. Wajah: Oval/Lonjong. Gradasi melengkung ke belakang.', 'assets/images/drop-fade.jpg'),
            ('Burst Fade', 45, 60000, 'Fade Haircut. Perawatan: Tinggi. Wajah: Lebar/Bulat. Gradasi melingkar di telinga.', 'assets/images/burst-fade.jpg'),
            ('Taper Fade', 40, 55000, 'Fade Haircut. Perawatan: Sedang. Wajah: Semua Tipe. Gradasi di jambang & leher.', 'assets/images/taper-fade.jpg'),

            -- C. UNDERCUT STYLE
            ('Undercut Classic', 35, 50000, 'Undercut Style. Perawatan: Sedang. Wajah: Bulat/Kotak. Samping tipis atas panjang.', 'assets/images/undercut-clasic.jpg'),
            ('Undercut Fade', 40, 55000, 'Undercut Style. Perawatan: Sedang. Wajah: Oval/Kotak. Kombinasi undercut dan fade.', 'assets/images/undercut-fade.jpg'),
            ('Disconnected Undercut', 40, 55000, 'Undercut Style. Perawatan: Tinggi. Wajah: Hati/Oval. Kontras tajam samping & atas.', 'assets/images/disconnected-undercut.jpg'),
            ('Undercut Slick Back', 45, 60000, 'Undercut Style. Perawatan: Tinggi. Wajah: Oval/Kotak. Disisir klimis ke belakang.', 'assets/images/undercut-slick-back.jpg'),

            -- D. SHORT HAIR STYLE
            ('French Crop', 35, 55000, 'Short Hair. Perawatan: Rendah. Wajah: Panjang/Oval. Poni pendek tekstur.', 'assets/images/french-crop.jpg'),
            ('Textured Crop', 35, 55000, 'Short Hair. Perawatan: Sedang. Wajah: Oval/Bulat. Crop dengan tekstur acak.', 'assets/images/textured-crop.jpg'),
            ('Caesar Cut', 30, 50000, 'Short Hair. Perawatan: Rendah. Wajah: Oval/Kotak. Poni rata sangat pendek.', 'assets/images/caesar-cut.jpg'),
            ('Short Quiff', 35, 55000, 'Short Hair. Perawatan: Sedang. Wajah: Bulat/Kotak. Jambul pendek.', 'assets/images/short-quiff.jpg'),

            -- E. MEDIUM HAIR STYLE
            ('Side Part', 35, 60000, 'Medium Hair. Perawatan: Sedang. Wajah: Kotak/Oval. Belah pinggir formal.', 'assets/images/side-part.jpg'),
            ('Comb Over', 35, 60000, 'Medium Hair. Perawatan: Sedang. Wajah: Kotak. Disisir menyamping rapi.', 'assets/images/comb-over.jpg'),
            ('Ivy League', 35, 60000, 'Medium Hair. Perawatan: Rendah. Wajah: Semua Tipe. Gaya mahasiswa preppy.', 'assets/images/ivy-league.jpg'),
            ('Slick Back', 40, 65000, 'Medium Hair. Perawatan: Tinggi. Wajah: Oval/Hati. Sisir basah ke belakang.', 'assets/images/slick-back.jpg'),
            ('Pompadour', 45, 70000, 'Medium Hair. Perawatan: Tinggi. Wajah: Bulat/Lebar. Volume tinggi di depan.', 'assets/images/pompadour.jpg'),

            -- F. MODERN & TRENDY
            ('Two Block', 40, 65000, 'Modern/Korean. Perawatan: Sedang. Wajah: Bulat/Oval. Khas Korea samping tipis.', 'assets/images/two-block.jpg'),
            ('Comma Hair', 45, 70000, 'Modern/Korean. Perawatan: Tinggi. Wajah: Tirus/Oval. Poni melengkung koma.', 'assets/images/comma-hair.jpg'),
            ('Korean Style', 40, 65000, 'Modern/Korean. Perawatan: Sedang. Wajah: Semua Tipe. Gaya layer soft.', 'assets/images/korean-style.jpg'),
            ('Messy Hair', 35, 60000, 'Modern. Perawatan: Rendah. Wajah: Semua Tipe. Gaya acak natural.', 'assets/images/messy-hair.jpg'),
            ('Curtain Hair', 40, 65000, 'Modern. Perawatan: Sedang. Wajah: Lebar/Kotak. Belah tengah gantung.', 'assets/images/curtain-hair.jpg'),

            -- G. VOLUME & TEXTURE
            ('Quiff', 40, 60000, 'Volume. Perawatan: Sedang. Wajah: Bulat/Kotak. Jambul bervolume.', 'assets/images/quiff.jpg'),
            ('Textured Quiff', 40, 65000, 'Volume. Perawatan: Sedang. Wajah: Bulat. Jambul bertekstur.', 'assets/images/textured-quiff.jpg'),
            ('Messy Quiff', 40, 60000, 'Volume. Perawatan: Rendah. Wajah: Oval. Jambul acak.', 'assets/images/messy-quiff.jpg'),
            ('Blow Hair', 45, 70000, 'Volume. Perawatan: Tinggi. Wajah: Semua Tipe. Styling dengan hairdryer.', 'assets/images/blow-hair.jpg'),

            -- H. UNIQUE & STATEMENT
            ('Mullet Modern', 50, 75000, 'Statement. Perawatan: Tinggi. Wajah: Hati/Oval. Pendek depan panjang belakang.', 'assets/images/mullet-modern.jpg'),
            ('Faux Hawk', 40, 65000, 'Statement. Perawatan: Sedang. Wajah: Bulat/Kotak. Mohawk modern halus.', 'assets/images/faux-hawk.jpg'),
            ('Mohawk', 45, 70000, 'Statement. Perawatan: Tinggi. Wajah: Kotak/Keras. Samping habis tengah berdiri.', 'assets/images/mohawk.jpg'),
            ('Wolf Cut', 55, 80000, 'Statement. Perawatan: Tinggi. Wajah: Oval/Panjang. Layer wispy berantakan.', 'assets/images/wolf-cut.jpg'),

            -- I. CURLY & WAVY
            ('Curly Fade', 45, 65000, 'Curly. Perawatan: Sedang. Wajah: Semua Tipe. Ikal atas dengan fade.', 'assets/images/curly-fade.jpg'),
            ('Curly Undercut', 45, 65000, 'Curly. Perawatan: Sedang. Wajah: Bulat. Ikal atas dengan undercut.', 'assets/images/curly-undercut.jpg'),
            ('Wavy Crop', 40, 60000, 'Wavy. Perawatan: Rendah. Wajah: Oval. Gelombang pendek.', 'assets/images/wavy-crop.jpg'),
            ('Perm Style', 90, 150000, 'Chemical. Perawatan: Tinggi. Wajah: Semua Tipe. Pengeritingan permanen.', 'assets/images/perm-style.jpg'),

            -- J. PANJANG & NATURAL
            ('Man Bun', 40, 70000, 'Long Hair. Perawatan: Sedang. Wajah: Oval/Kotak. Dicepol ke atas.', 'assets/images/man-bun.jpg'),
            ('Top Knot', 40, 70000, 'Long Hair. Perawatan: Sedang. Wajah: Bulat/Kotak. Cepol dengan samping tipis.', 'assets/images/top-knot.jpg'),
            ('Long Layer', 50, 75000, 'Long Hair. Perawatan: Tinggi. Wajah: Kotak. Rambut panjang berlayer.', 'assets/images/long-layer.jpg'),
            ('Shoulder Length Cut', 45, 70000, 'Long Hair. Perawatan: Sedang. Wajah: Oval/Lonjong. Potongan sebahu.', 'assets/images/shoulder-length-cut.jpg')
        `);

        console.log('... Inserting Barbers');
        await db.query(`
            INSERT INTO barbers (name, specialization, experience, image, is_active) VALUES 
            ('Andi Saputra', 'Classic Cut', 5, 'assets/images/ahmad-nasukha.jpg', true),
            ('Budi Santoso', 'Fade & Modern', 3, 'assets/images/hafiz-nur-syafiq.jpg', true),
            ('Citra Dewi', 'Coloring Expert', 4, 'assets/images/Adi-nur-khalifah.jpg', true)
        `);

        console.log('... Inserting Users (With Membership Features)');
        const adminPass = await bcrypt.hash('prasetyaadhi045', 10);
        const userPass = await bcrypt.hash('password123', 10);
        
        const userQuery = `
            INSERT INTO users (
                name, email, password, phone, role, profile_pic, 
                is_member, membership_status, membership_expiry, payment_proof
            ) 
            VALUES 
            -- 1. SUPER ADMIN
            ('Owner BarberDyy', 'prasetyaadhi398@gmail.com', $1, '081234567899', 'admin', 'uploads/profiles/default.png', 
             TRUE, 'active', NOW() + INTERVAL '1 year', NULL),           
            -- 2. USER BIASA (Adi - Belum Member)
            ('Adi User', 'user1@gmail.com', $2, '081200000001', 'user', 'uploads/profiles/default.png', 
             FALSE, 'inactive', NULL, NULL),           
            -- 3. USER CONTOH (Budi - Status Pending/Menunggu Konfirmasi)
            ('Budi User', 'user2@gmail.com', $2, '081200000002', 'user', 'uploads/profiles/default.png', 
             FALSE, 'pending', NULL, 'uploads/profiles/default_proof.jpg')
        `;
        
        await db.query(userQuery, [adminPass, userPass]);

        console.log('✅ Database Seeding Completed Successfully!');
        console.log('--------------------------------------------------');
        console.log('🔑 Admin (Active): prasetyaadhi398@gmail.com');
        console.log('🔑 User 1 (Inactive): user1@gmail.com');
        console.log('🔑 User 2 (Pending): user2@gmail.com');
        console.log('--------------------------------------------------');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding Failed:', error.message);
        if (error.message.includes('column')) {
            console.log('⚠️  Tips: Kolom "image" pada tabel services, atau "membership_status" mungkin belum ada. Pastikan struktur database sudah benar.');
        }
        process.exit(1);
    }
};

seedDatabase();