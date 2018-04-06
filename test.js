var tape = require('tape')

const ZDB = require('./index');
const cache1 = new ZDB({ group: "lru1", size: 1024, discoveryPort: 4567, name: "LRU #1", auto: true });
const cache2 = new ZDB({ group: "lru2", size: 1024, discoveryPort: 4567, name: "LRU #2", auto: true });

tape('add and get', function (t) {
  var rc = cache1
  rc.set('hello', 'world')
  t.same(rc.get('hello'), 'world')
  rc.clear()
  t.end()
})

tape('add and get buffer', function (t) {
  var rc = cache1
  rc.clear();
  rc.set('hello', Buffer.from('world'))
  t.same(rc.get('hello'), Buffer.from('world'))
  t.end()
})


tape('remove', function (t) {
  var rc = cache1

  rc.clear();
  t.same(rc.get('hello'), null)
  rc.delete('hello')
  t.same(rc.get('hello'), null)
  rc.set('hello', 'world')
  t.same(rc.get('hello'), 'world')
  rc.delete('hello')
  t.same(rc.get('hello'), null)
  rc.clear()
  t.end()
})

tape('clear', function (t) {
  var rc = cache1

  rc.clear();
  t.same(rc.get('hello'), null)
  rc.set('hello', 'a')
  rc.set('hello', 'b')
  rc.set('foo', 'bar')
  t.same(rc.get('hello'), 'b')
  rc.clear()
  t.same(rc.get('hello'), null)
  t.same(rc.get('foo'), null)
  t.end()
})

tape('maxAge', function (t) {
  var rc = cache1

  rc.clear();
  rc.set('hello', 'world')
  rc.set('hello', 'verden', { ttl: 20 })
  setTimeout(function () {
    t.same(rc.get('hello'), 'verden')
    setTimeout(function () {
      t.same(rc.get('hello'), null)
      rc.clear()
      t.end()
    }, 35)
  }, 5)
})

tape('add and get clone', function (t) {
  var rc = cache1
  var cp = cache2

  rc.clear();
  cp.clear();

  rc.set('hello', 'copy')
  setTimeout(function () {
    t.same(cp.get('hello'), 'copy')
    rc.clear()
    t.end()
  }, 35)
})

tape('maxAge', function (t) {
  var rc = cache1

  rc.clear();
  cache1.stop();
  cache2.stop();
  t.same(rc.get('hello'), null)
  t.end()
})
