/*
 * a general blog scraper
 * 
 * Saves data to mongodb, db: blog-scraper, collection: posts
 *
 * (C) Ilkka Huotari
 */

module.exports = getContents;
module.exports.init = init;

var cheerio = require("cheerio"),
	mongo = require('mongoskin'),
	moment = require('moment'),
	request = require('request'),
	URL = require('url'),
	db,
	domain;

function init(dbName, url) {
	db = mongo.db("mongodb://localhost:27017/" + dbName, {native_parser:true});
	db.bind('posts');
	var parsed = URL.parse(url);
	domain = parsed.protocol+'//'+parsed.host;
}

function finish() {
	console.log('Done.');
	process.exit();
}
// get url contents (blog post)
function getContents(url) {
	console.log(url);

	function done(error, response, body) {
		if (error) {
			console.log(error);

			// try again
			getContents(url);
		}
		else {
			var $ = cheerio.load(body),
				doc;

			try {
				doc = {
					url: url,
					title: $('div.contentContainer section.wide-article > article header h1').html(),
					body: $('div.contentContainer section.wide-article > article div.article-body').html(),
					comments: $('section.comment-list > section').html(),
					date: moment($('div.contentContainer section.wide-article > article time').attr('datetime')).toDate()
				};
			}
			catch (e) {
				console.log(e);

				// try again
				getContents(url);
			}

			db.posts.insert(doc, function err(error, inserted) {
				if (error) {
					console.log(error);
				}
				else {
					var next = $('.article-actions .continue-reading .next a').first();

					if (next.length) {
						getContents(absolute(domain, next.attr('href')));
					}
					else {
						finish();
					}
				}
			});
		}
	}

	if (url) {
		request(url, done);
	}
	else {
		finish();
	}
}

function absolute(base, relative) {
    return relative.match(/^https?:/)? relative: base + relative;
}



