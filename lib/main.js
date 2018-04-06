'use strict';
const Zyre = require('zyre.js');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
const LRU = require('receptacle');
const _ = require('lodash');
const ip = require('ip');
const peers = _initDatabase('peers',50);

function ZDB(params) {
    //console.log("ZDB");
    this.params = params;
    var self = this;
    this.selfIp = ip.address();
    this.db = _initDatabase(params);
    EventEmitter.call(self);
    this.z = new Zyre({
        name: this.params.name,
        headers: {
            group: this.params.group, // LRU UUID Instance
            size: this.params.size, // LRU Max Size
        },
        evasive: 5000, // Timeout after which the local node will try to ping a not responding peer
        expired: 30000, // Timeout after which a not responding peer gets disconnected
        bport: params.discoveryPort, // Discovery beacon broadcast port
        binterval: 1000, // Discovery beacon broadcast interval
    });

    self.z.setEncoding('utf8');
    if (this.params.auto) self.start();

    self.z.on('whisper', (id, name, message) => {
        console.log("whisper", id, name, message);
        const wm = JSON.parse(message);

        switch (wm.event) {
            case "set":
		self.db.set(wm.key, wm.value, wm.opt);
		break;
            case "database-find":
                self.emit(wm.event, {
                    id: id
                });
                break;
        }

    });
    self.z.on('shout', (id, name, message) => {
        console.log("shout", id, name, message);
    });

    this.peers = [];

    this.z.on('join', (id, name, group) => {
	peers.set(name,id);
        this.z.whisper(id, JSON.stringify({ event: 'database-find', id: id }));
    });
    this.z.on('expired', (id, name, group) => {
	this.peers[id] = null;
    });
    this.z.on('disconnect', (id, name, group) => {
	this.peers[id] = null;
    });

}

inherits(ZDB, EventEmitter);

ZDB.prototype.setDatabase = function(id, cb) {
    this.sdb = id;
};

ZDB.prototype.getPeerDatabases = function(cb) {
    const s = this.z.getPeers();
    var d = [];
    Object.keys(s).forEach(el => {
        s[el].id = el;
        d.push(s[el]);
    });
    return d;
};

ZDB.prototype.join = function(cb) {
    this.z.join(this.params.group);
    if (this.debug) this.on('database-find', function(e) { console.log('peers', this.getPeerDatabases() ); });
    if (cb) cb();
};
ZDB.prototype.start = function(cb) {
    this.z.start(function(){
	this.join();
	if (cb) cb();
    }.bind(this));
};

ZDB.prototype.stop = function(params) {
    this.z.stop();
};

/* LRU Commands */

ZDB.prototype.set = function(key,value,opt) {
    peers.items.forEach(function(item){
    	this.z.whisper(item.value, JSON.stringify({ event: "set", key: key, value: value, opt: opt||{}  }));
    }.bind(this));
    return this.db.set(key,value,opt||{});
};

ZDB.prototype.expire = function(key,ttl) {
    return this.db.expire(key,ttl||0);
};

ZDB.prototype.delete = function(key) {
    return this.db.delete(key);
};

ZDB.prototype.clear = function() {
    return this.db.clear();
};

ZDB.prototype.get = function(key) {
    return this.db.get(key);
};

ZDB.prototype.has = function(key) {
    return this.db.has(key);
};

ZDB.prototype.meta = function(key) {
    return this.db.meta(key);
};


module.exports = ZDB;

function _initDatabase(params) {
    const sd = new LRU({ id: params.group, max: params.size || 1024 });
    return sd;
}
