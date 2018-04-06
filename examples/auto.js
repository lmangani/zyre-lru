const ZDB = require('../index');
const db1 = new ZDB({ group: "lru1", size: 1024, discoveryPort: 4567, name: "LRU #1", auto: true });
const db2 = new ZDB({ group: "lru2", size: 1024, discoveryPort: 4567, name: "LRU #2", auto: true });

var test = function(){
	db1.set('test',100, { refresh: true });
	var t1 = db1.has('test');
	var t2 = db1.get('test');
	console.log('DB1:',t1, t2);
	var t1 = db2.has('test');
	var t2 = db2.get('test');
	console.log('DB2:',t1, t2);
}

setTimeout(test, 2000);
setTimeout(test, 3000);

process.on('SIGINT', function(params) {
    db1.stop();
    db2.stop();
    process.exit();
});
