import { Redis } from '@upstash/redis'

class RedisWrapper {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }

  async get<T>(key: string): Promise<T | null> {
    return this.redis.get<T>(key)
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<string | null> {
    if (options?.ex) {
      return this.redis.set(key, value, { ex: options.ex })
    }
    return this.redis.set(key, value)
  }
}

export const redis = new RedisWrapper() 