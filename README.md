# Ters Açık Artırma Mobil Uygulaması

Bu proje, Ters Açık Artırma platformunun mobil uygulamasıdır. Normal açık artırmaların tersine, bu platformda en düşük teklifi veren kazanır.

## Özellikler

- Kimlik doğrulama (giriş, kayıt, çıkış)
- Kullanıcı profili yönetimi
- Kategori listeleme
- İlan görüntüleme ve filtreleme
- İlan detayı görüntüleme
- Teklif verme
- Kullanıcı ilanları ve teklifleri yönetimi
- Admin paneli (firma onayları, kategori yönetimi)

## Teknolojiler

- React Native (Expo)
- TypeScript
- Context API 
- React Navigation
- React Native Paper (UI bileşenleri)
- Axios (HTTP istekleri)

## Başlangıç

### Gereksinimler

- Node.js (v12 veya üzeri)
- npm veya yarn
- Expo CLI
- Android Studio (Android geliştirme için)
- Xcode (iOS geliştirme için, yalnızca macOS üzerinde)

### Kurulum

1. Projeyi klonlayın:

```bash
git clone https://github.com/kullaniciadi/TersAcikArtirma.git
cd TersAcikArtirma/mobil
```

2. Bağımlılıkları yükleyin:

```bash
npm install
# veya
yarn install
```

3. Uygulamayı başlatın:

```bash
npx expo start
```

Bu komut bir QR kodu gösterecektir. Bu kodu Expo Go uygulamasıyla (iOS veya Android) tarayabilir veya bir emülatör/simülatör başlatabilirsiniz.

### Yapılandırma

`src/services/api.ts` dosyasındaki API URL'sini kendi sunucu adresinize göre ayarlayın:

```typescript
const API_URL = 'http://192.168.1.X:5001/api'; // IP adresinizle değiştirin
```

## Uygulamanın Ekran Görüntüleri

(Ekran görüntüleri buraya eklenecek)

## İletişim

Proje ile ilgili sorularınız için: [email@email.com]

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
