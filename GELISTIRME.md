# Geliştirici Dokümantasyonu

## Proje Yapısı

```
mobil/
├── assets/             # Görsel, font dosyaları vb.
├── src/
│   ├── components/     # Yeniden kullanılabilir bileşenler
│   ├── context/        # Context API bileşenleri
│   ├── hooks/          # Özel React Hooks'ları
│   ├── navigation/     # Navigasyon yapılandırması
│   ├── screens/        # Uygulama ekranları
│   ├── services/       # API servisleri
│   └── types/          # TypeScript tipleri ve arayüzleri
├── App.tsx             # Ana uygulama bileşeni
└── package.json        # Bağımlılıklar ve komutlar
```

## Eksik Ekranlar ve Özellikler

Aşağıdaki ekranlar ve özellikler henüz tamamlanmamıştır ve geliştirilmeye devam edilmesi gerekmektedir:

1. **ListingDetailScreen**: İlan detayları ekranı
   - İlan detaylarını gösterme
   - Teklif verme işlevi
   - Teklifleri listeleme

2. **CreateListingScreen**: Yeni ilan oluşturma ekranı
   - Form alanları
   - Resim yükleme
   - İlan gönderme

3. **MyListingsScreen**: Kullanıcının ilanlarını gösterme ekranı
   - İlanları listeleme
   - İlan durumlarını gösterme
   - İlanları iptal etme

4. **MyBidsScreen**: Kullanıcının tekliflerini gösterme ekranı
   - Teklifleri listeleme
   - Teklif durumlarını gösterme

5. **AdminScreen**: Admin paneli
   - Firma onay sistemi
   - Kategori yönetimi

## Bilinen Sorunlar

1. TypeScript ve React Native Paper bileşenleri arasındaki tiplemeler bazı hata mesajlarına neden olmaktadır. Bu hatalar görmezden gelinebilir çünkü çalışma zamanında bir soruna yol açmamaktadır.

2. AuthContext içindeki typescale sorunları düzeltilmelidir.

3. Expo Icons paketinin eksik bağımlılıkları nedeniyle bazı hatalar oluşabilir. Gerektiğinde `expo install @expo/vector-icons` komutu ile eksik paketleri yükleyebilirsiniz.

## API Entegrasyonu

Mevcut API uç noktaları `services` klasöründeki dosyalarda yapılandırılmıştır. Yeni API uç noktaları ekleneceği zaman bu dosyaların güncellenmesi gerekmektedir.

API URL'lerini yapılandırmak için `api.ts` dosyasındaki temel URL'yi kendi geliştirme ortamınıza göre ayarlayın:

```typescript
// Android Emulator için
const API_URL = 'http://10.0.2.2:5001/api';

// iOS Simulator için
// const API_URL = 'http://localhost:5001/api';

// Gerçek cihazlar için
// const API_URL = 'http://192.168.1.XXX:5001/api'; // Bilgisayarınızın IP adresi
```

## Stilizasyon ve Tema

Uygulama teması `components/theme.ts` dosyasında tanımlanmıştır. Ortak stil ve renk değişiklikleri bu dosya üzerinden yapılmalıdır.

React Native Paper üzerinde yapılan özelleştirmeler için [React Native Paper dokümantasyonunu](https://callstack.github.io/react-native-paper/docs/guides/custom-theme/) inceleyebilirsiniz.

## Test

Şu anda uygulama için otomatik testler bulunmamaktadır. Daha sonra jest veya react-native-testing-library kullanılarak birim ve entegrasyon testleri eklenebilir.

## Yapılması Gerekenler

1. Eksik ekranların tamamlanması
2. TypeScript tipleme hatalarının düzeltilmesi
3. Test senaryolarının ve otomatik testlerin eklenmesi
4. UI/UX iyileştirmeleri
5. Bildirim sistemi entegrasyonu
6. Offline mod desteği 