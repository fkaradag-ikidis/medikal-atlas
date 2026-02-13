// Supabase yapılandırması - Kendi bilgilerinizle değiştirin
const SUPABASE_URL = 'https://jptoeqfmejdkycrzmikj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bGg-UZ46lXuET4o1HAe0Tg_9H1u3cSk';

// Global supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth durumunu kontrol et
async function authKontrol() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if(!session) {
        if(!window.location.pathname.includes('giris.html')) {
            window.location.href = '/giris.html';
        }
        return null;
    }
    
    // Navbar güncelle
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileLink = document.getElementById('profileLink');
    
    if(loginBtn) loginBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'inline-block';
    if(profileLink) profileLink.style.display = 'inline-block';
    
    return session.user;
}

// Çıkış yap
async function cikisYap() {
    await supabase.auth.signOut();
    window.location.href = '/';
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', async () => {
    
    // Giriş Formu
    const girisForm = document.getElementById('girisForm');
    if(girisForm) {
        girisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('girisEmail').value;
            const sifre = document.getElementById('girisSifre').value;
            const hataMsg = document.getElementById('girisHata');
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: sifre
            });
            
            if(error) {
                if(hataMsg) hataMsg.textContent = error.message;
                alert('Giriş hatası: ' + error.message);
                return;
            }
            
            // Başarılı giriş - yönlendirme
            const { data: profil, error: profilError } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', data.user.id)
                .single();
            
            if(profilError) {
                console.error('Profil hatası:', profilError);
                window.location.href = '/profil.html';
                return;
            }
            
            if(profil && profil.rol === 'admin') {
                window.location.href = '/admin/panel.html';
            } else {
                window.location.href = '/profil.html';
            }
        });
    }
    
    // Kayıt Formu
    const kayitForm = document.getElementById('kayitForm');
    if(kayitForm) {
        kayitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const rol = document.getElementById('kayitRol').value;
            const email = document.getElementById('kayitEmail').value;
            const sifre = document.getElementById('kayitSifre').value;
            const hataMsg = document.getElementById('kayitHata');
            
            if(!rol) {
                if(hataMsg) hataMsg.textContent = 'Lütfen hesap tipi seçin';
                return;
            }
            
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: sifre,
            });
            
            if(authError) {
                if(hataMsg) hataMsg.textContent = authError.message;
                alert('Kayıt hatası: ' + authError.message);
                return;
            }
            
            // Profil bilgilerini güncelle
            const profilData = {
                id: authData.user.id,
                rol: rol,
                email: email,
                telefon: document.getElementById('telefon')?.value || ''
            };
            
            if(rol === 'firma') {
                profilData.firma_adi = document.getElementById('firmaAdi')?.value || '';
                profilData.vergi_no = document.getElementById('vergiNo')?.value || '';
            } else if(rol === 'doktor') {
                profilData.ad_soyad = document.getElementById('doktorAd')?.value || '';
                profilData.unvan = document.getElementById('doktorUnvan')?.value || '';
                profilData.brans = document.getElementById('doktorBrans')?.value || '';
            }
            
            const { error: profilError } = await supabase
                .from('profiles')
                .update(profilData)
                .eq('id', authData.user.id);
            
            if(profilError) {
                if(hataMsg) hataMsg.textContent = profilError.message;
                return;
            }
            
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            window
