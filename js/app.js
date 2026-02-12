// Ana uygulama fonksiyonları

// Ürünleri kategoriye göre yükle
async function urunleriFiltrele(kategori) {
    const { data: urunler, error } = await supabase
        .from('urunler')
        .select('*, profiles(firma_adi)')
        .eq('kategori', kategori);
    
    if(error) {
        console.error('Ürünler yüklenirken hata:', error);
        return;
    }
    
    document.getElementById('urunListesi').style.display = 'block';
    document.getElementById('seciliKategori').textContent = kategori.toUpperCase();
    
    const grid = document.getElementById('urunGrid');
    if(urunler.length === 0) {
        grid.innerHTML = '<p class="no-data">Bu kategoride henüz ürün bulunmamaktadır.</p>';
        return;
    }
    
    grid.innerHTML = urunler.map(urun => `
        <div class="product-card">
            <h3>${urun.urun_adi}</h3>
            <p class="product-meta">${urun.profiles?.firma_adi || 'Bilinmeyen Firma'}</p>
            <p><strong>Kategori:</strong> ${urun.kategori}</p>
            ${urun.kutu_fiyati ? `<p class="price">₺${urun.kutu_fiyati}</p>` : ''}
            <div class="compare-checkbox">
                <input type="checkbox" id="cmp-${urun.id}" value="${urun.id}" onchange="karsilastirSecim(${urun.id})">
                <label for="cmp-${urun.id}">Karşılaştır</label>
            </div>
            <button onclick="urunDetay('${urun.id}')" class="btn-secondary">Detay</button>
        </div>
    `).join('');
}

// Ürün ara
async function urunAra() {
    const arama = document.getElementById('arama').value;
    if(arama.length < 2) return;
    
    const { data: urunler } = await supabase
        .from('urunler')
        .select('*, profiles(firma_adi)')
        .ilike('urun_adi', `%${arama}%`);
    
    const grid = document.getElementById('urunGrid');
    // Benzer şekilde listele...
}

// Karşılaştırma için seçim
let karsilastirmaListesi = [];

function karsilastirSecim(urunId) {
    const checkbox = document.getElementById(`cmp-${urunId}`);
    
    if(checkbox.checked) {
        if(karsilastirmaListesi.length >= 3) {
            alert('En fazla 3 ürün karşılaştırabilirsiniz!');
            checkbox.checked = false;
            return;
        }
        karsilastirmaListesi.push(urunId);
    } else {
        karsilastirmaListesi = karsilastirmaListesi.filter(id => id !== urunId);
    }
    
    document.getElementById('karsilastirSayi').textContent = karsilastirmaListesi.length;
    document.getElementById('karsilastirBtn').disabled = karsilastirmaListesi.length === 0;
    
    // LocalStorage'a kaydet
    localStorage.setItem('karsilastirma', JSON.stringify(karsilastirmaListesi));
}

function karsilastirmayaEkle() {
    if(karsilastirmaListesi.length > 0) {
        window.location.href = '/karsilastir.html';
    }
}

// Ürün detay modalı (opsiyonel)
function urunDetay(urunId) {
    // Detay sayfasına yönlendir veya modal aç
    console.log('Ürün detay:', urunId);
}

// Mobil menü
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}