
const SUPABASE_URL = 'https://jptoeqfmejdkycrzmikj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bGg-UZ46lXuET4o1HAe0Tg_9H1u3cSk';

var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth durumunu kontrol et
async function authKontrol() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if(!session) {
        window.location.href = '/giris.html';
        return null;
    }
    
    // Navbar güncelle
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('profileLink').style.display = 'inline-block';
    
    return session.user;
}

async function cikisYap() {
    await supabase.auth.signOut();
    window.location.href = '/';
}

// Kayıt işlemi
document.addEventListener('DOMContentLoaded', () => {
    const kayitForm = document.getElementById('kayitForm');
    if(kayitForm) {
        kayitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const rol = document.getElementById('kayitRol').value;
            const email = document.getElementById('kayitEmail').value;
            const sifre = document.getElementById('kayitSifre').value;
            
            // Auth kaydı
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: sifre,
            });
            
            if(authError) {
                document.getElementById('kayitHata').textContent = authError.message;
                return;
            }
            
            // Profil kaydı
            const profilData = {
                id: authData.user.id,
                rol: rol,
                email: email,
                telefon: document.getElementById('telefon').value
            };
            
            if(rol === 'firma') {
                profilData.firma_adi = document.getElementById('firmaAdi').value;
                profilData.vergi_no = document.getElementById('vergiNo').value;
            } else if(rol === 'doktor') {
                profilData.ad_soyad = document.getElementById('doktorAd').value;
                profilData.unvan = document.getElementById('doktorUnvan').value;
                profilData.brans = document.getElementById('doktorBrans').value;
            }
            
            const { error: profilError } = await supabase
                .from('profiles')
                .insert([profilData]);
            
            if(profilError) {
                document.getElementById('kayitHata').textContent = profilError.message;
                return;
            }
            
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            window.location.href = '/giris.html';
        });
    }
    
    // Giriş işlemi
    const girisForm = document.getElementById('girisForm');
    if(girisForm) {
        girisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('girisEmail').value;
            const sifre = document.getElementById('girisSifre').value;
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: sifre
            });
            
            if(error) {
                document.getElementById('girisHata').textContent = error.message;
                return;
            }
            
            // Rol kontrolü ve yönlendirme
            const { data: profil } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', data.user.id)
                .single();
            
            if(profil.rol === 'admin') {
                window.location.href = '/admin/panel.html';
            } else {
                window.location.href = '/profil.html';
            }
        });
    }

});



