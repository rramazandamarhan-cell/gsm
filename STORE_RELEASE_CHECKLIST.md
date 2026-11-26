# GSM Simulator — Google Play & Apple App Store Son Yayın Kontrol Listesi

Bu belge, `index.html`, `vite.config.ts`, `capacitor.config.ts`, `public/privacy.html`, `public/terms.html`, `src/game/adService.ts`, `src/game/storeBridge.ts` ve `/store-assets/` dosyalarının birebir kod incelemesine göre hazırlanmıştır.

---

## 1. `index.html` Meta Etiketleri & Mobil Uyumluluk Kontrolü

| Kontrol Maddesi | Kod Durumu | Doğrulama Notu |
|---|---|---|
| `viewport` & Safe Area (`viewport-fit=cover`) | ✅ Hazır | Çentikli iPhone/Android ekranlarda tam ekran görünüm sağlar. |
| `theme-color` (`#0F141B`) | ✅ Hazır | Android üst sistem çubuğu ve PWA pencere rengiyle birebir uyumlu. |
| `mobile-web-app-capable` & `apple-mobile-web-app-capable` | ✅ Hazır | iOS/Android tam ekran uygulama başlatma desteği aktif. |
| `apple-mobile-web-app-status-bar-style` (`black-translucent`) | ✅ Hazır | Koyu arayüzle kesintisiz birleşim sağlar. |
| `apple-touch-icon` (`180x180`, `/apple-touch-icon.png`) | ✅ Hazır | Dosya `/public/apple-touch-icon.png` konumunda mevcut. |
| `apple-touch-startup-image` (Splash görseli) | ✅ Hazır | `/store-assets/feature-graphic-1024x500.png` tanımlı; native paketlemede Capacitor `SplashScreen` eklentisi devreye girer. |
| OpenGraph (`og:title`, `og:description`, `og:image`, `og:type`) | ✅ Hazır | `metadata.json` ile senkronize, sosyal paylaşım kartı görseli tanımlı. |
| Twitter Card (`summary_large_image` + `twitter:image`) | ✅ Hazır | Önizleme görseli mevcut. |
| Dil etiketi (`<html lang="tr">`) | ✅ Hazır | Türkçe birincil mağaza girişiyle uyumlu (uygulama içinde TR/EN geçişi de var). |

---

## 2. `vite.config.ts` PWA Manifest & Service Worker Doğrulaması

| Kontrol Maddesi | Kod Durumu | Doğrulama Notu |
|---|---|---|
| `name`, `short_name`, `description`, `id`, `start_url`, `scope` | ✅ Hazır | `GSM Simulator` / `GSM Sim`, kök kapsamlı (`/`) manifest eksiksiz. |
| `display` & `display_override` | ✅ Hazır | `standalone` + `['fullscreen', 'standalone']` ile tarayıcı çubuğu gizlenir. |
| `orientation: 'landscape'` | ✅ Hazır | Yatay oyun düzeni manifestte kilitli. |
| İkon Seti (`192x192`, `512x512`, `1024x1024` + `maskable`) | ✅ Hazır | Tüm 5 ikon dosyası `/public/` altında mevcut (`pwa-192x192.png`, `pwa-512x512.png`, `pwa-1024x1024.png`, `pwa-maskable-192x192.png`, `pwa-maskable-512x512.png`). |
| `screenshots` (Wide Form Factor) | ✅ Hazır | `/store-assets/feature-graphic-1024x500.png` (`1024x500`) tanımlı. |
| Workbox Çevrimdışı Önbellek (`includeAssets` & `runtimeCaching`) | ✅ Hazır | Statik varlıklar, `privacy.html`, `terms.html` ve Google Fonts çevrimdışı önbelleğe alınıyor. |
| `maximumFileSizeToCacheInBytes` (`6 MB`) | ✅ Hazır | Büyük bundle/görsel önbellekleme hatası önlendi. |

---

## 3. Mağaza Görselleri (`/store-assets/` & `/public/store-assets/`)

| Görsel | Boyut | Durum | Kullanım Yeri |
|---|---|---|---|
| `store-assets/app-icon-1024x1024.png` | `1024 × 1024 px` | ✅ Hazır | Google Play (512×512 otomatik ölçekleme/kırpma) & Apple App Store (1024×1024 alfa kanalsız). |
| `store-assets/feature-graphic-1024x500.png` | `1024 × 500 px` | ✅ Hazır | Google Play Öne Çıkan Grafik (Feature Graphic). |
| Mağaza Ekran Görüntüleri (Telefon + Tablet) | Min. 2–8 adet | ⏳ Yayın Öncesi | Gerçek telefon (yatay 16:9 / 19.5:9) ve tablet (iPad 13" + Android 10") üzerinde Tezgah, Atölye, IMEI Sorgu ve Piyasa ekranlarından yakalanıp mağaza paneline yüklenecek. |

---

## 4. Gizlilik Politikası, Kullanım Koşulları & HTTPS Bağlantıları

| Kontrol Maddesi | Kod Durumu | Yayın Öncesi Yapılacak |
|---|---|---|
| KVKK + AdMob Uyumlu `public/privacy.html` | ✅ Hazır | Herkese açık HTTPS domaine (ör. Netlify, Cloudflare Pages, GitHub Pages) yayınlanmalı. |
| `public/terms.html` (Sanal ekonomi & telif bildirimi) | ✅ Hazır | Aynı HTTPS domaine yayınlanmalı. |
| `.env` içinde `VITE_PUBLIC_SITE_URL` | ⏳ Yayın Öncesi | Yayınladığınız gerçek HTTPS alan adını yazın (ör. `https://gsmsimulator.com`). Uygulama içi `StoreComplianceModal` linkleri otomatik olarak bu canlı HTTPS adresine yönlenir. |
| Destek E-postası (`support@gsmsimulator.app`) | ⏳ Yayın Öncesi | `src/game/storeBridge.ts`, `public/privacy.html` ve `public/terms.html` içindeki örnek e-postayı kendi aktif destek e-postanızla güncelleyin. |
| Uygulama İçi Veri Silme & Gizlilik Onayı | ✅ Hazır | `StoreComplianceModal` üzerinden tek dokunuşla tüm yerel veriler sıfırlanabiliyor. |

---

## 5. Native Paketleme (Capacitor), Reklam (AdMob) & Mağaza Politikaları

| Kontrol Maddesi | Platform | Durum | Açıklama |
|---|---|---|---|
| `capacitor.config.ts` (`appId: com.esnafgsm.simulator`, SplashScreen, StatusBar, Keyboard) | Android & iOS | ✅ Hazır | Çakışan eski `capacitor.config.json` temizlendi; tek kaynak `capacitor.config.ts`. |
| Yerel Native Paket Kurulumu (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`, `@capacitor-community/admob`) | Android & iOS | ⏳ Bilgisayarda | Projeyi indirip `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor-community/admob` ardından `npx cap add android` / `npx cap add ios` çalıştırın. |
| Android Target SDK 35+ & İmzalı `.aab` | Google Play | ⏳ Android Studio | Play Console güncel politikası gereği `targetSdkVersion >= 35` ile imzalı App Bundle (`.aab`) üretin. |
| Gerçek AdMob App ID & Reklam Birimleri | Android & iOS | ⏳ Yayın Öncesi | `.env` içine gerçek AdMob ID'lerinizi girin, `VITE_ADMOB_TESTING=false` yapın; `AndroidManifest.xml` ve `Info.plist` (`GADApplicationIdentifier` + `SKAdNetworkItems`) içine AdMob Uygulama Kimliğinizi ekleyin. |
| GDPR / UMP & iOS ATT İzni | Android & iOS | ⏳ AdMob Panel | AdMob konsolundan Avrupa/TR için UMP rıza mesajı oluşturun; iOS `Info.plist` içine `NSUserTrackingUsageDescription` ekleyin. |
| Google Play Data Safety & "Contains Ads" | Google Play | ⏳ Play Console | "Reklam İçerir: Evet" seçin; Veri Güvenliği formunda AdMob için "Cihaz veya diğer kimlikler (Reklam Kimliği) — Reklam veya pazarlama" beyanını işaretleyin. |
| İçerik Derecelendirme (IARC) & Kapalı Test | Google Play | ⏳ Play Console | IARC anketini doldurun; yeni bireysel geliştirici hesabında zorunlu 12 test kullanıcısı × 14 gün kapalı testi tamamlayın. |
| Apple Guideline 4.2 (Web Wrapper Reddi Önleme) | App Store | ✅ Kod Hazır | Yatay ekran kilidi, durum çubuğu gizleme, native açılış ekranı, dokunsal titreşim (`Haptics`) ve yerel inceleme (`InAppReview`) köprüleri `storeBridge.ts` içinde hazır; gerçek iPhone/iPad üzerinde test edilip `.ipa` alınmalıdır. |
| Telif / Marka Temizliği | Android & iOS | ✅ Doğrulandı | Tüm cihaz markaları orijinal parodidir (`aPhone`, `Samxung`, `RedMix`, `PocoPop`); kullanıcıya görünen metinlerde gerçek marka ihlali bulunmamaktadır. |

---

## 6. Yatay Ekran Kilidi (Orientation Lock), Splash & Nihai Paketleme Komutları

Aşağıdaki komutlar projeyi indirip kendi bilgisayarınızda Android (`.aab`) ve iOS (`.ipa`) paketlerini üretirken izleyeceğiniz sıradır:

1. **Canlı HTTPS Gizlilik & Koşullar Yayını:** `public/privacy.html` ve `public/terms.html` dosyalarını herkese açık bir HTTPS adrese yayınlayın; `.env` dosyasında `VITE_PUBLIC_SITE_URL=https://alanadiniz.com` ve gerçek AdMob ID'lerinizi (`VITE_ADMOB_TESTING=false`) tanımlayın.
2. **Üretim Derlemesi:**
   ```bash
   npm install
   npm run build
   ```
3. **Capacitor Native Paketleme:**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/splash-screen @capacitor/status-bar @capacitor/haptics @capacitor-community/admob
   npx cap add android
   npx cap add ios
   npx cap sync
   ```
4. **Native Yatay Ekran Kilidi (Android & iOS):**
   - **Android (`android/app/src/main/AndroidManifest.xml`):** Ana `<activity>` içine `android:screenOrientation="sensorLandscape"` ekleyin; `<application>` içine AdMob `com.google.android.gms.ads.APPLICATION_ID` meta etiketini girin.
   - **iOS (`ios/App/App/Info.plist`):** `UISupportedInterfaceOrientations` listesini yalnızca `UIInterfaceOrientationLandscapeLeft` ve `UIInterfaceOrientationLandscapeRight` olacak şekilde ayarlayın; `GADApplicationIdentifier`, `SKAdNetworkItems` ve `NSUserTrackingUsageDescription` anahtarlarını ekleyin.
5. **Splash & İkon Üretimi (Tek Komut):**
   ```bash
   npx @capacitor/assets generate --iconPath store-assets/app-icon-1024x1024.png --splashPath store-assets/feature-graphic-1024x500.png --splashBackgroundColor "#0F141B" --splashBackgroundColorDark "#0F141B"
   ```
6. **Mağaza Yüklemesi:**
   - **Google Play:** Android Studio → *Build > Generate Signed Bundle / APK > Android App Bundle (`.aab`)* → Play Console'da Kapalı Test (12 test kullanıcısı × 14 gün) başlatın.
   - **Apple App Store:** Xcode → *Product > Archive > Distribute App* → TestFlight ile gerçek iPhone/iPad üzerinde test edip App Store incelemesine gönderin.

