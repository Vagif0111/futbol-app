# Futbol Uygulaması

Next.js 14 (App Router) + TypeScript + Tailwind. Mobil öncelikli, hafif, gereksiz animasyon yok.

## Kurulum

```bash
npm install
cp .env.local.example .env.local   # API_FOOTBALL_KEY değerini gir
npm run dev
```

API anahtarı: https://dashboard.api-football.com (ücretsiz plan: 100 istek/gün).
Anahtar **sadece** `.env.local` içinde tutulur, sunucu tarafındaki `src/lib/api-football.ts` dışında hiçbir yerde kullanılmaz — frontend'e asla sızmaz.

## Mimari

```
src/
  lib/api-football.ts     # API-Football ile konuşan tek yer (server-only)
  lib/cache.ts             # TTL cache + eşzamanlı istek birleştirme
  lib/formations.ts        # Taktik tahtası formasyon şablonları
  lib/favorites.ts         # Favoriler (localStorage)
  types/football.ts        # Ortak veri modelleri
  app/api/...               # Backend proxy route'ları (anahtarı gizler)
  app/...                    # Sayfalar
  components/                # UI bileşenleri
  hooks/useApi.ts            # Client fetch + cache + opsiyonel polling
```

## Veri kaynağı: API-Football — desteklenen / desteklenmeyen

| Özellik | Durum |
|---|---|
| Skor, maç durumu, canlı dakika | ✅ Destekleniyor |
| Goller, asistler, sarı/kırmızı kart, oyuncu değişikliği | ✅ Destekleniyor (`/fixtures/events`) |
| **Resmi ilk 11** | ✅ Destekleniyor, genelde maçtan 30-60 dk önce yayınlanır |
| **Muhtemel (tahmini) ilk 11** | ❌ **Desteklenmiyor.** API'de bu veri yok. Uygulama bunu uydurmuyor — resmi kadro açıklanana kadar "Kadro henüz açıklanmadı" mesajı gösteriliyor, açıklanınca otomatik güncelleniyor. |
| Maç istatistikleri (şut, top hakimiyeti, korner...) | ✅ Destekleniyor, ligin kapsamına göre bazı alanlar eksik olabilir |
| Oyuncu sezon istatistikleri | ✅ Destekleniyor, büyük liglerde daha detaylı |
| Takım profili, puan durumu | ✅ Destekleniyor |
| Geçmiş / gelecek maçlar | ✅ Destekleniyor |
| **WebSocket / SSE** | ❌ API'de yok, sadece REST. Canlı ekranlar 60 sn'de bir polling yapıyor. |
| Saniyelik gerçek zamanlı veri | ❌ Ücretsiz kotayla (100 istek/gün) gerçekçi değil. Prod kullanım için ücretli plan gerekir. |

## Performans önlemleri

- Sunucu tarafında TTL cache + aynı anki istekleri birleştirme (`withCache`)
- Client tarafında 20sn cache + istek iptali (AbortController)
- Canlı veri dışında polling yok; canlı ekranlarda 60 sn aralık
- `next/image` ile `unoptimized` (API-Football logoları zaten optimize, harici host)
- Gereksiz re-render'ı önlemek için sekme bazlı veri çekimi (yalnızca aktif tab için istek)
- API hatası uygulamayı çökertmiyor — her ekranda anlaşılır hata mesajı + "tekrar dene"

## Şu ana kadar tamamlanan (Faz 1)

1. Ana sayfa (bugün / canlı / yaklaşan / son maçlar / favoriler)
2. Maç listesi ve kartları
3. Maç detay (skor, olaylar, kadrolar, istatistik)
4. Takım ve oyuncu sayfaları (sezon seçimi ile)
5. Backend API bağlantısı (anahtar gizli, cache'li)
6. Taktik tahtası (6 formasyon, sürükle-bırak, gerçek oyuncu arama, yedek kulübesi, kaydet/yükle)
7. Lig sayfaları (puan durumu, yaklaşan/son maçlar)
8. Arama (oyuncu, takım, lig)
9. Favoriler (takım, oyuncu, lig)

## Sonraki adımlar (opsiyonel)

- Takım kadrosu ve takım istatistikleri sekmesi (team page'e `/players?team=` eklenebilir)
- Şampiyonlar Ligi/Avrupa Ligi için grup/eleme aşaması özel görünümü
- Service worker ile offline fallback
