
# Zyre-LRU <img src="https://user-images.githubusercontent.com/1423657/38137158-590eefbc-3423-11e8-96dd-487022b5618c.gif" width=100 /><img src="https://travis-ci.org/lmangani/zyre-lru.svg?branch=master"/>
[ZRE](https://rfc.zeromq.org/spec:20/ZRE/) enabled decentralised &amp; distributed LRU Cache w/ TTL

**Zyre-LRU** will spawn multiple **LRUs** with `set` actions syncronized via `whisper` or `shout`  

### Usage
```javascript
const ZDB = require('zyre-lru');
```

#### Peering
```javascript
// Initialize peers
const db1 = new ZDB({ group: "lru1", size: 1024, discoveryPort: 4567, name: "LRU #1", auto: true });
const db2 = new ZDB({ group: "lru2", size: 1024, discoveryPort: 4567, name: "LRU #2", auto: true });

// Set Value
db1.set('test',123);
db1.get('test'); //should return 123

/* set action will propagate to all connected peers */

db2.get('test'); // should return 123

// Shutdown peers when done
db1.stop();
db2.stop();

````

#### LRU Commands
```javascript
const ZDB = require('zyre-lru');
const cache = new ZDB({ group: "lru1", size: 1024, discoveryPort: 4567, name: "LRU #1", auto: true });

cache.set("item", 1, { ttl: 100 }); //-> Add item to cache (expire in 100ms).

cache.get("item"); //-> 1
cache.has("item"); //-> true
cache.expire("item", 50); //-> Expire in 50ms (instead of 100).
cache.delete("item"); //-> Delete item right away.
cache.clear(); //-> Empty the cache.
// You can also use the "refresh" option to automatically reset a keys expiration when accessed.
cache.set("item", 1, { ttl: 100, refresh: true });
// 50ms later
cache.get("item"); // Resets timer back to 100ms.
// And store meta data about values.
cache.set("item", 1, { meta: { custom: 1 } });
// Then retrieve it.
cache.meta("item"); //-> { custom: 1 }
```

### Acknowledgement 
Zyre-LRU is spinoff clone of [zyre-nedb](https://github.com/arcoirislabs/zyre-nedb) using [zyre.js](https://github.com/interpretor/zyre.js) and [receptacle](https://github.com/DylanPiercey/receptacle)

