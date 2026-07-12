// ==========================================
// 1. KONFIGURASI URL APPS SCRIPT 
// ==========================================
var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydU10KyvBX9royhk2jKtDRPdxXWtwlqUIa6Q8spThUyoq718kUVxy8SkZqme9iSkVa/exec';

// ==========================================
// 2. DATA TAMU CADANGAN (Tanpa No HP)
// ==========================================
var DATA_TAMU_CADANGAN = [
    { no: 1, kategori: 'Keluarga Blabag', nama: 'Mas Heri', id: 'heri', kode: 'KB-001', status: 'Sudah', waktuLogin: '04/07/2026 14:30:25' },
    { no: 2, kategori: 'Keluarga Blabag', nama: 'Mas Yoto', id: 'yoto', kode: 'KB-002', status: '', waktuLogin: '' },
    { no: 3, kategori: 'Keluarga Blabag', nama: 'Mas Mudi', id: 'mudi', kode: 'KB-003', status: 'Sudah', waktuLogin: '04/07/2026 15:10:02' }
];

// ==========================================
// 3. STORAGE KEY
// ==========================================
var STORAGE_KEY = 'bf_wedding_session';
var AMPLOP_KEY = 'bf_amplop_opened';

// ==========================================
// 4. ELEMEN DOM
// ==========================================
var cover = document.getElementById('cover');
var amplopPage = document.getElementById('amplop-page');
var loginBtn = document.getElementById('loginBtn');
var loginError = document.getElementById('loginError');
var deviceWarning = document.getElementById('deviceWarning');
var inputId = document.getElementById('inputId');
var inputKode = document.getElementById('inputKode');
var namaDisplay = document.getElementById('namaTamuDisplay');
var guestTarget = document.getElementById('guest-target');
var amplopGuestName = document.getElementById('amplopGuestName');
var pantunNama = document.getElementById('pantunNama');
var waktuLoginText = document.getElementById('waktuLoginText');

var currentNama = '';
var currentKode = '';
var currentId = '';
var currentWaktuLogin = '';
var isAmplopOpened = false;
var musicStarted = false;
var countdownInterval = null;

// ==========================================
// 5. CEK SESSION DI localStorage
// ==========================================
function cekSession() {
    var session = localStorage.getItem(STORAGE_KEY);
    if (session) {
        try {
            var data = JSON.parse(session);
            if (data.expiry && Date.now() < data.expiry) {
                currentNama = data.nama;
                currentId = data.id;
                currentKode = data.kode;
                currentWaktuLogin = data.waktuLogin || '';
                
                isAmplopOpened = localStorage.getItem(AMPLOP_KEY) === 'true';
                if (isAmplopOpened) {
                    langsungKeUndangan(data.nama);
                } else {
                    tampilkanAmplop(data.nama);
                }
                return true;
            } else {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(AMPLOP_KEY);
            }
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(AMPLOP_KEY);
        }
    }
    return false;
}

// ==========================================
// 6. FUNGSI TAMPILKAN AMPLOP
// ==========================================
function tampilkanAmplop(nama) {
    cover.classList.add('hidden');
    document.getElementById('main-scroll-screen').style.display = 'none';
    amplopPage.className = 'show';
    amplopGuestName.textContent = 'Yth. ' + nama;
}

// ==========================================
// 7. FUNGSI BUKA AMPLOP
// ==========================================
function bukaAmplop() {
    if (isAmplopOpened) return;
    isAmplopOpened = true;
    localStorage.setItem(AMPLOP_KEY, 'true');
    
    amplopPage.className = 'hide';
    
    setTimeout(function() {
        amplopPage.style.display = 'none';
        document.getElementById('main-scroll-screen').style.display = 'block';
        
        namaDisplay.textContent = 'Selamat datang, ' + currentNama + '!';
        guestTarget.textContent = 'Yth. ' + currentNama;
        pantunNama.textContent = currentNama;
        
        if (currentWaktuLogin) {
            waktuLoginText.textContent = 'Login: ' + currentWaktuLogin + ' WIB';
        } else {
            waktuLoginText.textContent = '-- Belum tercatat --';
        }
        
        playMusic();
        setTimeout(triggerFadeUpAnimations, 400);
    }, 800);
}

// ==========================================
// 8. FUNGSI LANGSUNG KE UNDANGAN
// ==========================================
function langsungKeUndangan(nama) {
    cover.classList.add('hidden');
    amplopPage.style.display = 'none';
    document.getElementById('main-scroll-screen').style.display = 'block';
    
    namaDisplay.textContent = 'Selamat datang, ' + nama + '!';
    guestTarget.textContent = 'Yth. ' + nama;
    pantunNama.textContent = nama;
    
    if (currentWaktuLogin) {
        waktuLoginText.textContent = 'Login: ' + currentWaktuLogin + ' WIB';
    } else {
        waktuLoginText.textContent = '-- Belum tercatat --';
    }
    
    playMusic();
    setTimeout(triggerFadeUpAnimations, 400);
}

// ==========================================
// 9. FUNGSI PLAY MUSIK
// ==========================================
function playMusic() {
    if (!musicStarted) {
        var audio = document.getElementById('main-wedding-audio');
        audio.volume = 0.7;
        audio.play().catch(function(e) {
            document.addEventListener('click', function playOnClick() {
                audio.play().catch(function() {});
                document.removeEventListener('click', playOnClick);
            }, { once: true });
        });
        musicStarted = true;
        document.getElementById('audioIcon').className = "fa-solid fa-circle-pause";
    }
}

// ==========================================
// 10. FUNGSI PROSES LOGIN (Revisi)
// ==========================================
async function prosesLogin() {
    var id = inputId.value.trim().toLowerCase();
    var kode = inputKode.value.trim().toUpperCase();

    loginError.className = 'error-msg';
    loginError.textContent = '';
    deviceWarning.className = 'device-warning';

    // Pengecekan input kosong
    if (!id || !kode) {
        loginError.textContent = '⚠️ NAMA dan KODE UNDANGAN harus diisi!';
        loginError.className = 'error-msg show';
        return;
    }

    // Pengecekan format kode
    if (!/^[A-Z]{2,4}-\d{3}$/.test(kode)) {
        loginError.textContent = '❌ Format kode salah!';
        loginError.className = 'error-msg show';
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Memverifikasi...';

    try {
        var response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'login',
                id: id,
                kode: kode
            })
        });

        var result = await response.json();

        if (result.status === 'success') {
            var waktuLogin = result.waktuLogin || '';
            
            var sessionData = {
                id: id,
                nama: result.nama,
                kode: kode,
                waktuLogin: waktuLogin,
                expiry: Date.now() + (30 * 24 * 60 * 60 * 1000)
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
            
            currentNama = result.nama;
            currentId = id;
            currentKode = kode;
            currentWaktuLogin = waktuLogin;
            isAmplopOpened = false;
            localStorage.removeItem(AMPLOP_KEY);
            
            tampilkanAmplop(result.nama);
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Masuk';
            return;
        } else {
            if (result.waktuLogin) {
                loginError.textContent = '❌ ' + result.pesan + ' (Login: ' + result.waktuLogin + ')';
            } else {
                loginError.textContent = '❌ ' + result.pesan;
            }
            loginError.className = 'error-msg show';
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Masuk';
            return;
        }

    } catch (error) {
        console.warn('Apps Script error, pakai data cadangan:', error);
        
        // Pencarian hanya menggunakan ID (Nama) dan Kode Undangan
        var tamu = DATA_TAMU_CADANGAN.find(function(t) {
            return t.id === id && t.kode === kode;
        });

        if (!tamu) {
            loginError.textContent = '❌ Data tidak ditemukan! Periksa NAMA dan KODE UNDANGAN Anda.';
            loginError.className = 'error-msg show';
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Masuk';
            return;
        }

        if (tamu.status === 'Sudah') {
            var waktuSebelumnya = tamu.waktuLogin || 'waktu tidak diketahui';
            deviceWarning.textContent = '⚠️ Kode ini sudah digunakan! (Login: ' + waktuSebelumnya + ')';
            deviceWarning.className = 'device-warning show';
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Masuk';
            return;
        }

        var now = new Date();
        var waktuLogin = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        var sessionData = {
            id: id,
            nama: tamu.nama,
            kode: kode,
            waktuLogin: waktuLogin,
            expiry: Date.now() + (30 * 24 * 60 * 60 * 1000)
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        
        currentNama = tamu.nama;
        currentId = id;
        currentKode = kode;
        currentWaktuLogin = waktuLogin;
        isAmplopOpened = false;
        localStorage.removeItem(AMPLOP_KEY);
        
        tampilkanAmplop(tamu.nama);
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Masuk';
    }
}

// ==========================================
// 11. CEK SESSION SAAT LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('main-scroll-screen').style.display = 'none';
    
    var sudahLogin = cekSession();
    
    setTimeout(function() {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loading-screen').style.display = 'none';
            if (!sudahLogin) {
                cover.classList.remove('hidden');
            }
        }, 800);
    }, 1500);
    
    initCountdown();
    loadComments();
});

// ==========================================
// 12. FUNGSI LAINNYA
// ==========================================
var audio = document.getElementById('main-wedding-audio');
var scrollContainer = document.getElementById('main-scroll-screen');

function navigateTo(event, targetId, element) {
    event.preventDefault();
    var navs = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navs.length; i++) {
        navs[i].classList.remove('active');
    }
    element.classList.add('active');
    
    var navContainer = document.querySelector('.bottom-nav');
    var scrollPos = element.offsetLeft - (navContainer.clientWidth / 2) + (element.offsetWidth / 2);
    navContainer.scrollTo({ left: scrollPos, behavior: 'smooth' });
    
    var targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
}

var observerOptions = { root: scrollContainer, rootMargin: '0px', threshold: 0.4 };
var observer = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
            var id = entries[i].target.getAttribute('id');
            var navs = document.querySelectorAll('.nav-item');
            for (var j = 0; j < navs.length; j++) {
                navs[j].classList.remove('active');
                if (navs[j].getAttribute('href') === '#' + id) {
                    navs[j].classList.add('active');
                    var navContainer = document.querySelector('.bottom-nav');
                    var scrollPos = navs[j].offsetLeft - (navContainer.clientWidth / 2) + (navs[j].offsetWidth / 2);
                    navContainer.scrollTo({ left: scrollPos, behavior: 'smooth' });
                }
            }
        }
    }
}, observerOptions);

var sections = document.querySelectorAll('.phone-screen section');
for (var i = 0; i < sections.length; i++) {
    observer.observe(sections[i]);
}

function toggleAudio() {
    var icon = document.getElementById('audioIcon');
    if (audio.paused) { 
        audio.play();
        icon.className = "fa-solid fa-circle-pause"; 
        musicStarted = true;
    } else { 
        audio.pause();
        icon.className = "fa-solid fa-circle-play"; 
    }
}
function setVolume(val) { audio.volume = val; }
function pauseMainMusic() { 
    audio.pause();
    document.getElementById('audioIcon').className = "fa-solid fa-circle-play"; 
}
function resumeMainMusic() { 
    audio.play();
    document.getElementById('audioIcon').className = "fa-solid fa-circle-pause"; 
}

scrollContainer.addEventListener('scroll', triggerFadeUpAnimations);
function triggerFadeUpAnimations() {
    var targets = document.querySelectorAll('.fade-up');
    var containerHeight = scrollContainer.clientHeight;
    for (var i = 0; i < targets.length; i++) {
        var rect = targets[i].getBoundingClientRect();
        if (rect.top < containerHeight * 0.95) {
            targets[i].classList.add('visible');
        }
    }
}

function initCountdown() {
    var targetDate = new Date("Aug 1, 2026 09:00:00").getTime();
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(function() {
        var now = new Date().getTime();
        var diff = targetDate - now;
        if (diff > 0) {
            document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
            document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('mins').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('secs').innerText = Math.floor((diff % (1000 * 60)) / 1000);
        }
    }, 1000);
}

function openLightbox(src) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxGal').style.display = 'flex';
}
function closeLightbox() { document.getElementById('lightboxGal').style.display = 'none'; }

// ==========================================
// 13. RSVP & COMMENTS
// ==========================================
var scriptURL = 'https://script.google.com/macros/s/AKfycbxW5_9UoxIInG8L8ltvthWu2-Q5UREvsAz3rcgftB_P1XHEosRkEAMRQQ7aq7fZGMwd/exec';
var form = document.forms['rsvp-form'];
var submitBtn = document.getElementById('submit-btn');

function submitRSVP(e) {
    e.preventDefault();
    submitBtn.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Mengirim...";
    submitBtn.disabled = true;
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(function(response) {
            alert('Terima kasih! Pesan Anda berhasil dikirim.');
            form.reset();
            submitBtn.innerHTML = "Kirim Ucapan";
            submitBtn.disabled = false;
            loadComments();
        })
        .catch(function(error) {
            alert('Terjadi kesalahan. Silakan coba lagi.');
            submitBtn.innerHTML = "Kirim Ucapan";
            submitBtn.disabled = false;
        });
}

function loadComments() {
    var box = document.getElementById('comments-box');
    fetch(scriptURL)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            box.innerHTML = '';
            if (data.length === 0) {
                box.innerHTML = '<p style="text-align:center; margin-top:20px; font-size:0.9rem;">Belum ada ucapan. Jadilah yang pertama!</p>';
            }
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if (item.nama && item.ucapan) {
                    var dateStr = "";
                    if (item.timestamp) {
                        var d = new Date(item.timestamp);
                        dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    }
                    var labelKonfirmasi = item.konfirmasi ? '( <i class="fa-solid fa-check"></i> ' + item.konfirmasi + ' )' : '';
                    box.innerHTML += '<div class="comment-node"><strong>' + item.nama + '</strong> <span>' + labelKonfirmasi + '</span><p>' + item.ucapan + '</p><div style="font-size:0.6rem; color:#888; margin-top:4px;">' + dateStr + '</div></div>';
                }
            }
        })
        .catch(function(err) {
            box.innerHTML = '<p style="color:red; text-align:center;">Gagal memuat ucapan.</p>';
        });
}

// ==========================================
// 14. ENTER KEY UNTUK LOGIN (Revisi)
// ==========================================
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        var target = e.target;
        if (target.id === 'inputId' || target.id === 'inputKode') {
            prosesLogin();
        }
    }
});

inputId.addEventListener('input', function() {
    this.value = this.value.toLowerCase();
});

inputKode.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
});