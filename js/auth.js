// Supabase yapılandırması
const SUPABASE_URL = 'https://jptoeqfmejdkycrzmikj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bGg-UZ46lXuET4o1HAe0Tg_9H1u3cSk';

// Supabase client oluştur (var kullanarak tekrar tanımlama hatasını önler)
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth durumunu kontrol et
async function authKontrol() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if(!session) {
        // Eğer giriş sayfasında değilsek ve session yoksa girişe yönlendir
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
            
            // Başarılı giriş - rol kontrolü
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
            
            // Yönlendirme
            if(profil && profil.rol === 'admin') {
                window.location.href = '/admin/p
