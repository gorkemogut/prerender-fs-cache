var cacheManager = require('cache-manager');
var fsStore = require('cache-manager-fs');

module.exports = {
	init: function () {
		this.cache = cacheManager.caching({
			store: fsStore,
			maxsize: process.env.CACHE_MAXSIZE || 500 * 1000 * 1000 * 1000,
			ttl: process.env.CACHE_TTL || 0, // 60 * 60,/*seconds*/
			path: 'cache',
			preventfill: true
		});
	},

	requestReceived: function (req, res, next) {
		this.cache.get(req.prerender.url, function (err, result) {
			if (!err && result) {
				req.prerender.cacheHit = true;
				res.send(200, result);
			} else {
				next();
			}
		});
	},

	beforeSend: function (req, res, next) {
		if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
			this.cache.set(req.prerender.url, req.prerender.content);
		}
		next();
	}
};