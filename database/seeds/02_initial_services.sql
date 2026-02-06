-- Seed: Initial services
-- Created: 2026-02-01 (Updated with 45 Styles)

-- 1. Bersihkan Data Lama
DELETE FROM services;

-- 2. Reset Urutan ID (Supaya mulai dari 1 lagi)
ALTER SEQUENCE services_id_seq RESTART WITH 1;

-- 3. Masukkan 45 Gaya Rambut Lengkap
INSERT INTO services (name, description, duration, price, image, is_active) VALUES

-- KATEGORI: FADE & TAPER
('Taper Fade', 'Gradasi halus di sisi, tetap tebal di atas. Cocok untuk semua wajah.', 45, 55000, 'assets/images/taper-fade.jpg', true),
('Skin Fade', 'Gradasi habis sampai kulit. Tampilan sangat bersih dan tajam.', 45, 60000, 'assets/images/skin-fade.jpg', true),
('Low Fade', 'Gradasi dimulai rendah di dekat telinga. Lebih subtil dan rapi.', 45, 55000, 'assets/images/low-fade.jpg', true),
('Mid Fade', 'Gradasi dimulai di tengah sisi kepala. Keseimbangan sempurna.', 45, 55000, 'assets/images/mid-fade.jpg', true),
('High Fade', 'Gradasi dimulai tinggi di atas pelipis. Kontras tinggi.', 45, 55000, 'assets/images/high-fade.jpg', true),
('Burst Fade', 'Gradasi melengkung di sekitar telinga, bagian belakang tetap tebal.', 50, 60000, 'assets/images/burst-fade.jpg', true),
('Drop Fade', 'Garis fade melengkung turun ke belakang kepala.', 45, 55000, 'assets/images/drop-fade.jpg', true),

-- KATEGORI: UNDERCUT
('Undercut Classic', 'Sisi samping tipis, atas panjang disisir ke belakang. Ikonik.', 40, 50000, 'assets/images/undercut-clasic.jpg', true),
('Undercut Fade', 'Kombinasi struktur undercut dengan halusnya fade.', 45, 55000, 'assets/images/undercut-fade.jpg', true),
('Disconnected Undercut', 'Tanpa gradasi, garis tegas memisah samping dan atas.', 45, 55000, 'assets/images/disconnected-undercut.jpg', true),
('Undercut Slick Back', 'Undercut dengan rambut atas disisir klimis licin ke belakang.', 45, 60000, 'assets/images/undercut-slick-back.jpg', true),
('Curly Undercut', 'Undercut khusus untuk rambut keriting. Menghilangkan beban samping.', 50, 60000, 'assets/images/curly-undercut.jpg', true),

-- KATEGORI: TEXTURED & CROP
('Textured Crop', 'Potongan pendek bertekstur, poni rata. Modern dan maskulin.', 40, 50000, 'assets/images/textured-crop.jpg', true),
('French Crop', 'Poni lurus ke depan, sisi tipis. Sangat populer dan stylish.', 40, 50000, 'assets/images/french-crop.jpg', true),
('Caesar Cut', 'Potongan sangat pendek dengan poni super pendek ala Romawi.', 30, 45000, 'assets/images/caesar-cut.jpg', true),
('Wavy Crop', 'Crop cut untuk rambut bergelombang agar terlihat rapi natural.', 45, 55000, 'assets/images/wavy-crop.jpg', true),

-- KATEGORI: QUIFF & POMPADOUR
('Quiff', 'Jambul depan diangkat ke atas dan belakang. Bervolume.', 45, 55000, 'assets/images/quiff.jpg', true),
('Short Quiff', 'Versi pendek dari Quiff, lebih rapi dan low maintenance.', 40, 50000, 'assets/images/short-quiff.jpg', true),
('Textured Quiff', 'Quiff dengan tekstur acak/messy untuk kesan santai.', 45, 55000, 'assets/images/textured-quiff.jpg', true),
('Messy Quiff', 'Jambul berantakan yang disengaja. Casual look.', 45, 55000, 'assets/images/messy-quiff.jpg', true),
('Pompadour', 'Jambul tinggi melengkung ke belakang. Klasik Rock n Roll.', 50, 65000, 'assets/images/pompadour.jpg', true),

-- KATEGORI: RAMBUT PANJANG & KOREAN STYLE
('Two Block', 'Gaya Korea, samping tipis atas tebal natural.', 45, 55000, 'assets/images/two-block.jpg', true),
('Comma Hair', 'Poni melengkung membentuk tanda koma ala artis K-Pop.', 45, 60000, 'assets/images/comma-hair.jpg', true),
('Korean Style', 'Gaya rambut Korea umum dengan tekstur lembut.', 45, 55000, 'assets/images/korean-style.jpg', true),
('Curtain Hair', 'Belah tengah dengan poni panjang menjuntai seperti tirai.', 45, 55000, 'assets/images/curtain-hair.jpg', true),
('Long Layered', 'Rambut panjang dengan layer agar tidak terlihat berat.', 55, 70000, 'assets/images/long-layer.jpg', true),
('Man Bun', 'Rambut panjang diikat cepol di atas. Maskulin.', 35, 45000, 'assets/images/man-bun.jpg', true),
('Top Knot', 'Kuncir atas dengan sisi samping tipis/fade.', 40, 50000, 'assets/images/top-knot.jpg', true),
('Shoulder Length Cut', 'Potongan sebahu, rapi dan tetap gondrong.', 50, 65000, 'assets/images/shoulder-length-cut.jpg', true),

-- KATEGORI: CLASSIC & FORMAL
('Classic Cut', 'Gaya standar pria, rapi, sopan, dan profesional.', 35, 45000, 'assets/images/classic-cut.jpg', true),
('Clean Cut', 'Potongan bersih, pendek, dan sangat rapi.', 30, 40000, 'assets/images/clean-cut.jpg', true),
('Side Part', 'Belah pinggir klasik dengan garis tegas.', 40, 50000, 'assets/images/side-part.jpg', true),
('Slick Back', 'Disisir licin ke belakang penuh. Elegan.', 40, 55000, 'assets/images/slick-back.jpg', true),
('Comb Over', 'Menyisir rambut dari satu sisi ke sisi lain. Rapi.', 40, 50000, 'assets/images/comb-over.jpg', true),
('Ivy League', 'Potongan ala mahasiswa elit, pendek tapi bisa disisir.', 40, 50000, 'assets/images/ivy-league.jpg', true),
('Crew Cut', 'Potongan cepak tapi masih ada sedikit rambut di atas.', 30, 40000, 'assets/images/crew-cut.jpg', true),
('Buzz Cut', 'Potongan cepak militer, hampir botak. Praktis.', 20, 35000, 'assets/images/buz-cut.jpg', true),

-- KATEGORI: TRENDY & UNIK
('Mullet Modern', 'Pendek depan, panjang belakang. Gaya retro hits kembali.', 50, 60000, 'assets/images/mullet-modern.jpg', true),
('Wolf Cut', 'Layer shaggy liar, kombinasi mullet dan shag.', 55, 65000, 'assets/images/wolf-cut.jpg', true),
('Mohawk', 'Sisi habis, tengah berdiri tegak. Gaya punk/rock.', 50, 60000, 'assets/images/mohawk.jpg', true),
('Faux Hawk', 'Mohawk versi lebih kalem dan lebar. Sporty.', 45, 55000, 'assets/images/faux-hawk.jpg', true),
('Blow Hair', 'Gaya rambut ditiup ke atas/belakang memberikan volume udara.', 45, 55000, 'assets/images/blow-hair.jpg', true),
('Curly Fade', 'Fade di samping, rambut keriting alami di atas.', 45, 55000, 'assets/images/curly-fade.jpg', true),
('Messy Hair', 'Gaya acak natural bangun tidur tapi tetap stylish.', 40, 50000, 'assets/images/messy-hair.jpg', true),
('Perm Style', 'Pengeritingan permanen untuk tekstur bergelombang.', 90, 150000, 'assets/images/perm-style.jpg', true);

-- Verify
SELECT count(*) as total_services FROM services;