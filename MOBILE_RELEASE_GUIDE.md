# GSM Simulator — Google Play & Apple App Store Yayınlama Rehberi

Bu proje Google Play (`.aab`), Apple App Store (`.ipa`) ve Google AdMob geliri için hazır hale getirilmiştir.

## 1. Hazır Mağaza Görselleri
- **1024×1024 Uygulama İkonu (Şeffaf değil, App Store & Play Store uyumlu):** `public/store-assets/app-icon-1024x1024.png`
- **1024×500 Google Play Öne Çıkan Görsel (Feature Graphic):** `public/store-assets/feature-graphic-1024x500.png`
- **Gizlilik Politikası & Kullanım Koşulları:** `public/privacy.html` ve `public/terms.html`
  - Ücretsiz olarak Cloudflare Pages, Vercel veya GitHub Pages üzerinde yayınlayıp `.env` dosyasındaki `VITE_PUBLIC_SITE_URL` değerini canlı alan adınıza ayarlayın.

## 2. Capacitor ile Android & iOS Yerel Paketleme
Bilgisayarınızda projeyi dışa aktardıktan sonra tek seferlik şu komutları çalıştırın:

```bash
npm install
npm install @capacitor/core @capacitor/android @capacitor/ios @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen @capacitor/screen-orientation @capacitor-community/admob
npm install -D @capacitor/cli
npm run build
npx cap add android
npx cap add ios
npm run cap:sync
```

### Android Studio (.aab Derleme)
1. `android/app/src/main/AndroidManifest.xml` içine Google AdMob **Android App ID** meta-data satırını ekleyin:
   ```xml
   <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
   ```
2. `android/app/src/main/AndroidManifest.xml` içinde `MainActivity` için `android:screenOrientation="sensorLandscape"` ayarlayın.
3. `npm run cap:android` ile Android Studio'yu açıp **Build → Generate Signed App Bundle (.aab)** ile Google Play Console'a yükleyin.

### Xcode / Apple App Store (.ipa Derleme)
1. `ios/App/App/Info.plist` içine:
   - `GADApplicationIdentifier`: Google AdMob **iOS App ID**
   - `NSUserTrackingUsageDescription`: *"Size daha ilgili ödüllü reklamlar sunabilmemiz için izninizi istiyoruz."*
   - `UISupportedInterfaceOrientations`: Yalnızca `UIInterfaceOrientationLandscapeLeft` ve `UIInterfaceOrientationLandscapeRight`
2. `npm run cap:ios` ile Xcode'u açıp Apple Developer hesabınızla **Product → Archive → Distribute App (App Store Connect)** adımlarını tamamlayın.

## 3. Google AdMob Dengeli Gelir Stratejisi (Kodda Kurulu!)
- **Ödüllü Video Reklam (Rewarded Ad — Yüksek eCPM):**
  - Çevrimdışı Gelir Modalı: *"Reklam İzle · 2x"* butonu
  - Gün Sonu Raporu: *"Reklam İzle · +%25 Prim"* butonu
- **Dengeli Geçiş Reklamı (Interstitial Ad — Oyuncuyu Bunaltmaz):**
  - 1. ve 2. gün **0 geçiş reklamı** (oyuncuyu oyuna bağlar).
  - 3. günden itibaren **en fazla 3 oyun gününde bir** ve **gerçek zamanda minimum 4 dakika arayla**, yalnızca gün sonu geçişinde gösterilir.
- Yayınlamadan önce `.env` dosyasında `VITE_ADMOB_TESTING=false` yapıp kendi AdMob birim kimliklerinizi girin.
