/*
 * a general blog scraper
 * 
 * Saves data to mongodb, db blog-scraper, collection posts
 *
 * (C) Ilkka Huotari
 */

var cheerio = require("cheerio"),
	mongo = require('mongoskin'),
	moment = require('moment'),
	request = require('request'),
	URL = require('url'),
	db = mongo.db("mongodb://localhost:27017/blog-scraper", {native_parser:true}),
	domain;

db.bind('posts');

function usage() {
	console.log('\nScrape usage');
	console.log('\tnode index.js scrape <url>');
	console.log('\nPosts will be saved to mongodb://blog-scraper\n');
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
			console.log(i+": "+error);

			// try again
			getContents(url);
		}
		else {
			var $ = cheerio.load(body),
				doc;

			try {
				doc = {
					url: url,
					body: $('#main-content > .node').html(),
					comments: $('#comments').html(),
					date: moment($('article time').attr('datetime')).toDate()
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

(function main() {
	var url;

	if (process.argv.length !== 3) {
		usage();
		process.exit(1);
	}
	
	url = process.argv[2];
	parsed = URL.parse(url);
	domain = parsed.protocol+'//'+parsed.host;
	getContents(url);
}());

