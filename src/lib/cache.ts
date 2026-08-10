// Basit in-memory TTL cache. Serverless ortamda instance yeniden başlayınca
// sıfırlanır — bu bilinçli bir tradeoff (ücretsiz API kotasını korumak için
// yine de büyük fayda sağlar). Kalıcı cache gerekiyorsa Redis'e taşınabilir.

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// Aynı anahtar için eşzamanlı isteklerin API'yi birden fazla kez vurmasını
// önler (request de-duplication).
const inFlight = new Map<string, Promise<unknown>>();

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = fetcher()
    .then((value) => {
      cacheSet(key, value, ttlSeconds);
      inFlight.delete(key);
      return value;
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}
