// Navigasi dan Inisialisasi Data
function getDB(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- NAVIGASI ---
function showRole() { hideAll(); document.getElementById('view-role').style.display = 'block'; }
function showLoginAdmin() { hideAll(); document.getElementById('view-login').style.display = 'block'; }
function showGuestInput() { hideAll(); document.getElementById('view-guest').style.display = 'block'; }
function showDashboard() { 
    hideAll(); 
    document.getElementById('view-dashboard').style.display = 'block'; 
    document.getElementById('admin-profile').style.display = 'flex';
    switchTab('buku'); 
}

function hideAll() {
    const views = document.querySelectorAll('.view-section');
    views.forEach(v => v.style.display = 'none');
    document.getElementById('admin-profile').style.display = 'none';
}

function logoutAdmin() { showRole(); }

function prosesLogin() {
    const u = document.getElementById('admin-user').value;
    const p = document.getElementById('admin-pass').value;
    if(u === 'admin' && p === 'admin123') {
        showDashboard();
    } else {
        alert('Username/Password salah!');
    }
}

// --- FITUR TAMU ---
function submitGuest() {
    const nama = document.getElementById('guest-nama').value;
    const alamat = document.getElementById('guest-alamat').value;
    const hp = document.getElementById('guest-hp').value;
    const tujuan = document.getElementById('guest-tujuan').value;
    let pekerjaan = document.querySelector('input[name="job"]:checked')?.value;
    if(pekerjaan === 'Lainnya') pekerjaan = document.getElementById('job-lainnya-text').value;
    const jk = document.querySelector('input[name="jk"]:checked')?.value;

    if(!nama || !alamat || !pekerjaan || !jk || !hp || !tujuan) { 
        alert("Semua kolom data diri wajib diisi!"); 
        return; 
    }

    showModal("Apakah data diri Anda sudah benar?", "Konfirmasi", () => {
        const tamuDB = getDB('tamu');
        const newGuest = {
            id_tamu: Date.now(),
            nama, alamat, pekerjaan, jk, hp_telp: hp, tujuan,
            tanggal_kunjungan: new Date().toISOString()
        };
        tamuDB.push(newGuest);
        saveDB('tamu', tamuDB);

        // Bersihkan Form
        document.getElementById('guest-nama').value = '';
        document.getElementById('guest-alamat').value = '';
        document.getElementById('guest-hp').value = '';
        document.getElementById('guest-tujuan').value = '';
        document.querySelectorAll('input[name="job"], input[name="jk"]').forEach(r => r.checked = false);
        
        showModal(`Pendaftaran Berhasil! ID Anda: ${newGuest.id_tamu}`, "Tutup", () => showRole());
    });
}

// --- DASHBOARD TABS ---
function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');

    if(tab === 'buku') loadBuku();
    if(tab === 'tamu') loadTamu();
    if(tab === 'pinjam') loadPinjam();
}

// --- DATA BUKU ---
function loadBuku() {
    const data = getDB('buku');
    const tbody = document.querySelector('#tabel-buku tbody');
    tbody.innerHTML = '';
    data.forEach(b => {
        tbody.innerHTML += `
            <tr>
                <td>${b.id_buku}</td>
                <td>${b.judul}</td>
                <td>${b.penulis}</td>
                <td>${b.penerbit}</td>
                <td>${b.tahun}</td>
                <td><button class="btn-red" onclick="hapusBuku(${b.id_buku})">Hapus</button></td>
            </tr>`;
    });
}

function tambahBuku() {
    const judul = document.getElementById('buku-judul').value;
    const penulis = document.getElementById('buku-penulis').value;
    const penerbit = document.getElementById('buku-penerbit').value;
    const tahun = document.getElementById('buku-tahun').value;

    if(!judul || !penulis || !penerbit || !tahun) {
        alert("Semua kolom buku wajib diisi!");
        return;
    }

    const bukuDB = getDB('buku');
    bukuDB.push({ id_buku: Date.now(), judul, penulis, penerbit, tahun });
    saveDB('buku', bukuDB);
    loadBuku();
    
    document.getElementById('buku-judul').value = '';
    document.getElementById('buku-penulis').value = '';
    document.getElementById('buku-penerbit').value = '';
    document.getElementById('buku-tahun').value = '';
}

function hapusBuku(id) {
    showModal("Anda yakin ingin menghapus buku ini?", "Hapus", () => {
        let bukuDB = getDB('buku');
        bukuDB = bukuDB.filter(b => b.id_buku !== id);
        saveDB('buku', bukuDB);
        loadBuku();
    });
}

// --- DATA TAMU (ADMIN) ---
function loadTamu() {
    const data = getDB('tamu');
    const tbody = document.querySelector('#tabel-tamu-admin tbody');
    tbody.innerHTML = '';
    data.forEach(t => {
        const tgl = t.tanggal_kunjungan.split('T')[0];
        tbody.innerHTML += `
            <tr>
                <td>${t.id_tamu}</td>
                <td>${t.nama}</td>
                <td>${t.alamat}</td>
                <td>${t.pekerjaan}</td>
                <td>${t.jk}</td>
                <td>${t.hp_telp}</td>
                <td>${t.tujuan}</td>
                <td>${tgl}</td>
                <td><button class="btn-red" onclick="hapusTamu(${t.id_tamu})">Hapus</button></td>
            </tr>`;
    });
}

function hapusTamu(id) {
    showModal("Hapus data tamu ini?", "Hapus", () => {
        let tamuDB = getDB('tamu');
        tamuDB = tamuDB.filter(t => t.id_tamu !== id);
        saveDB('tamu', tamuDB);
        loadTamu();
    });
}

// --- PEMINJAMAN ---
function lookupTamu() {
    const id = document.getElementById('pinjam-id-tamu').value;
    const tamuDB = getDB('tamu');
    const tamu = tamuDB.find(t => t.id_tamu == id);
    document.getElementById('nama-tamu-display').innerText = tamu ? `Nama Tamu: ${tamu.nama}` : 'Nama Tamu: ID tidak ditemukan';
}

function lookupBuku() {
    const id = document.getElementById('pinjam-id-buku').value;
    const bukuDB = getDB('buku');
    const buku = bukuDB.find(b => b.id_buku == id);
    document.getElementById('judul-buku-display').innerText = buku ? `Judul Buku: ${buku.judul}` : 'Judul Buku: ID tidak ditemukan';
}

function loadPinjam() {
    const data = getDB('pinjam');
    const tbody = document.querySelector('#tabel-pinjam tbody');
    tbody.innerHTML = '';
    const today = new Date().toISOString().slice(0, 10);

    data.forEach(p => {
        const tglPinjam = p.tanggal_peminjaman;
        const tglKembali = p.tanggal_pengembalian;
        let btnStatus = p.status === 'Pinjam' 
            ? `<button class="btn-green" onclick="kembalikanBuku(${p.id_peminjaman})">Kembali</button>` 
            : '<span class="status-back">Kembali</span>';
        
        let rowClass = (p.status === 'Pinjam' && tglKembali < today) ? 'row-late' : '';

        tbody.innerHTML += `
            <tr class="${rowClass}">
                <td>${p.id_peminjaman}</td>
                <td>${p.id_buku}</td>
                <td>${p.judul}</td>
                <td>${p.id_tamu}</td>
                <td>${p.nama_tamu}</td>
                <td>${tglPinjam}</td>
                <td>${tglKembali}</td>
                <td>${btnStatus}</td>
            </tr>`;
    });
}

function tambahPeminjaman() {
    const id_tamu = document.getElementById('pinjam-id-tamu').value;
    const id_buku = document.getElementById('pinjam-id-buku').value;
    const lama = parseInt(document.getElementById('pinjam-hari').value);

    const tamu = getDB('tamu').find(t => t.id_tamu == id_tamu);
    const buku = getDB('buku').find(b => b.id_buku == id_buku);

    if(!tamu || !buku || !lama) {
        alert("Data tidak valid atau kolom kosong!");
        return;
    }

    const pinjamDB = getDB('pinjam');
    const tglPinjam = new Date();
    const tglKembali = new Date();
    tglKembali.setDate(tglPinjam.getDate() + lama);

    pinjamDB.push({
        id_peminjaman: Date.now(),
        id_tamu,
        nama_tamu: tamu.nama,
        id_buku,
        judul: buku.judul,
        tanggal_peminjaman: tglPinjam.toISOString().slice(0, 10),
        tanggal_pengembalian: tglKembali.toISOString().slice(0, 10),
        status: 'Pinjam'
    });

    saveDB('pinjam', pinjamDB);
    loadPinjam();
}

function kembalikanBuku(id) {
    showModal("Konfirmasi pengembalian buku?", "Ya", () => {
        let pinjamDB = getDB('pinjam');
        const index = pinjamDB.findIndex(p => p.id_peminjaman === id);
        if(index !== -1) {
            pinjamDB[index].status = 'Kembali';
            saveDB('pinjam', pinjamDB);
            loadPinjam();
        }
    });
}

// --- FITUR STANDAR (Jam & Filter) ---
function updateClock() {
    const now = new Date();
    document.getElementById('realtime-clock').innerText = now.toLocaleTimeString('id-ID');
    document.getElementById('realtime-date').innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

function filterTable(tableId, inputId) {
    const filter = document.getElementById(inputId).value.toUpperCase();
    const tr = document.getElementById(tableId).getElementsByTagName("tr");
    for (let i = 1; i < tr.length; i++) {
        tr[i].style.display = [...tr[i].tds = tr[i].getElementsByTagName("td")].some(td => td.innerText.toUpperCase().includes(filter)) ? "" : "none";
    }
}

// Modal Utilities
let confirmCallback = null;
function showModal(msg, btnText, callback) {
    const m = document.getElementById('custom-modal');
    document.getElementById('modal-msg').innerText = msg;
    const btnYes = document.getElementById('modal-yes');
    btnYes.innerText = btnText;
    btnYes.className = btnText === 'Hapus' ? 'btn-red' : 'btn-green';
    m.style.display = 'flex';
    m.classList.add('show');
    confirmCallback = callback;
    btnYes.onclick = () => { if(confirmCallback) confirmCallback(); closeModal(); };
}
function closeModal() { 
    const m = document.getElementById('custom-modal');
    m.classList.remove('show');
    setTimeout(() => { m.style.display = 'none'; }, 300);
}

document.addEventListener('DOMContentLoaded', showRole);