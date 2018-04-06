const ZDB = require('../index');
const db1 = new ZDB({ group: "lru1", size: 1024, discoveryPort: 4567, name: "LRU #1" });
const db2 = new ZDB({ group: "lru2", size: 1024, discoveryPort: 4567, name: "LRU #2" });

db1.start(function(){ cb() });
db2.start();

var cb = function(){
	console.log('Alright...');
	db1.set('test',100, { refresh: true });
	var t1 = db1.has('test');
	var t2 = db1.get('test');
	console.log('RESULT:',t1, t2);
}


process.on('SIGINT', function(params) {
    db1.stop();
    process.exit();
});
