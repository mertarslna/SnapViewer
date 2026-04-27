# 👻 SnapViewer & 📸 InstaViewer

SnapViewer, Snapchat ve Instagram'dan indirdiğiniz verileri (JSON formatında) şık, hızlı ve modern bir arayüzle görüntülemenizi sağlayan profesyonel bir web uygulamasıdır. Varsayılan metin dosyaları veya karmaşık JSON yapıları yerine, tüm mesaj geçmişinizi tıpkı bir mesajlaşma uygulamasındaymış gibi inceleyebilirsiniz.

---

## ✨ Özellikler

- **Dual Platform Desteği:** Tek bir arayüz üzerinden hem Snapchat hem de Instagram verileri arasında geçiş yapabilirsiniz.
- **Gelişmiş Arama:** 
  - **Kişi Arama:** Arkadaş listenizde hızlıca arama yapın.
  - **Global Mesaj Arama:** Tüm sohbet geçmişinizde belirli kelimeleri arayın ve hangi sohbette kaç eşleşme olduğunu görün.
  - **Sohbet İçi Arama:** Seçili sohbet içindeki mesajları filtreleyin.
- **Tarih Filtreleme:** Belirli bir tarih aralığındaki mesajları görüntülemek için takvim filtresini kullanın.
- **Modern Arayüz:** 
  - **Karanlık Mod:** Göz yormayan şık karanlık tema.
  - **Animasyonlar:** Framer Motion ile pürüzsüz geçişler.
  - **Responsive Tasarım:** Farklı ekran boyutlarına uyumlu yapı.
- **Performans Odaklı:** Binlerce mesajı takılmadan yüklemek için "Daha Fazla Yükle" mantığı ile optimize edilmiştir.
- **Medya ve Paylaşım:** Paylaşılan bağlantıları ve medya türlerini (resim, video vb.) görselleştirilmiş şekilde görün.

---

## 🛠️ Teknolojiler

- **React 19**
- **Vite** (Hızlı geliştirme ve derleme)
- **Framer Motion** (Akıcı animasyonlar)
- **Lucide React** (Modern ikon seti)
- **Date-fns** (Gelişmiş tarih yönetimi)
- **CSS3** (Modern Glassmorphism tasarımı)

---

## 🚀 Kurulum ve Çalıştırma

### 1. Projeyi Klonlayın veya İndirin
```bash
git clone https://github.com/kullaniciadi/SnapViewer.git
cd SnapViewer/snap-viewer
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Verilerinizi Hazırlayın
Uygulamanın verileri okuyabilmesi için verilerin belirli bir klasör yapısında olması gerekir:

- **Snapchat:** Snapchat verilerinizi indirin ve zipten çıkarın. `mydata/json` klasörünü projenin kök dizinine (snap-viewer klasörünün bir üstü) kopyalayın.
- **Instagram:** Instagram verilerinizi (JSON formatında) indirin ve `instagramdata` klasörünü projenin kök dizinine kopyalayın.

Ardından şu komutu çalıştırarak verileri uygulama formatına dönüştürün:
```bash
npm run process
```

### 4. Uygulamayı Başlatın
```bash
npm run dev
```
Uygulama `http://localhost:5173` adresinde çalışmaya başlayacaktır.

---

## 📁 Dosya Yapısı

- `src/App.jsx`: Ana uygulama bileşeni ve UI mantığı.
- `src/utils/dataProcessor.js`: JSON verilerini parse eden ve filtreleyen yardımcı fonksiyonlar.
- `scripts/`: Ham verileri `public/data` altına işleyen scriptler.
- `public/data/`: İşlenmiş verilerin (chat_history.json, friends.json vb.) tutulduğu yer.

---

## 🛡️ Gizlilik Notu

Bu uygulama tamamen yerel (local) çalışır. Verileriniz hiçbir sunucuya yüklenmez, sadece tarayıcınızda ve bilgisayarınızda işlenir. Güvenle kullanabilirsiniz.

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

*Geliştiren: [Mert Arslan](https://github.com/mertarslan)*
