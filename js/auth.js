// Supabase yapılandırması
const SUPABASE_URL = 'https://jptoeqfmejdkycrzmikj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bGg-UZ46lXuET4o1HAe0Tg_9H1u3cSk';

// Global değişken - farklı isim kullanarak çakışmayı önle
window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Tüm fonksiyonlarda window.db kullanacağız
async function authKontrol() {
    const { data: { session } } = await window.db.auth.getSession();
    
    if(!session) {
        if(!window.location.pathname.includes('giris.html')) {
            window.location.href = '/giris.html';
        }
        return null;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileLink = document.getElementById('profileLink');
    
    if(loginBtn) loginBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'inline-block';
    if(profileLink) profileLink.style.display = 'inline-block';
    
    return session.user;
}

async function cikisYap() {
    await window.db.auth.signOut();
    window.location.href = '/';
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    
    // Giriş Formu
    const girisForm = document.getElementById('girisForm');
    if(girisForm) {
        girisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('girisEmail').value;
            const sifre = document.getElementById('girisSifre').value;
            const hataMsg = document.getElementById('girisHata');
            
            const { data, error } = await window.db.auth.signInWithPassword({
                email: email,
                password: sifre
            });
            
            if(error) {
                if(hataMsg) hataMsg.textContent = error.message;
                alert('Giriş hatası: ' + error.message);
                return;
            }
            
            // Başarılı giriş - rol kontrolü
            const { data: profil, error: profilError } = await window.db
                .from('profiles')
                .select('rol')
                .eq('id', data.user.id)
                .single();
            
            if(profilError) {
                console.error('Profil hatası:', profilError);
                window.location.href = '/profil.html';
                return;
            }
            
            // Yönlendirme
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
            
            const { data: authData, error: authError } = await window.db.auth.signUp({
                email: email,
                password: sifre,
            });
            
            if(authError) {
                if(hataMsg) hataMsg.textContent = authError.message;
                alert('Kayıt hatası: ' + authError.message);
                return;
            }
            
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
            
            const { error: profilError } = await window.db
                .from('profiles')
                .update(profilData)
                .eq('id', authData.user.id);
            
            if(profilError) {
                if(hataMsg) hataMsg.textContent = profilError.message;
                return;
            }
            
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            window.location.href = '/giris.html';
        });
    }
    
    // Sayfa yüklendiğinde auth kontrolü
    if(!window.location.pathname.includes('giris.html')) {
        await authKontrol();
    }
});
