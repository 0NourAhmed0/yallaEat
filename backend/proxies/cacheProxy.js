class CacheProxy {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  /**
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to fetch data if not in cache
   * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
   */
  async get(key, fetchFunction, ttlMs = 5 * 60 * 1000) {
    if (this.cache.has(key)) {
      const expiryTime = this.ttl.get(key);
      
      if (Date.now() < expiryTime) {
        console.log(`Cache HIT for key: ${key}`);
        return this.cache.get(key);
      } else {
        console.log(`Cache EXPIRED for key: ${key}`);
        this.invalidate(key);
      }
    }

    // Cache miss - fetch data
    console.log(`Cache MISS for key: ${key}`);
    const data = await fetchFunction();
    
    this.cache.set(key, data);
    this.ttl.set(key, Date.now() + ttlMs);
    
    return data;
  }

  
   //Invalidate a specific cache key
  invalidate(key) {
    console.log(`Invalidating cache for key: ${key}`);
    this.cache.delete(key);
    this.ttl.delete(key);
  }


   //Invalidate cache keys matching a pattern
  
  invalidatePattern(pattern) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.invalidate(key));
    console.log(`Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
  }

  
  //Clear all cache
  clearAll() {
    console.log('Clearing all cache');
    this.cache.clear();
    this.ttl.clear();
  }

  
    //Get cache statistics
  
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
module.exports = new CacheProxy();