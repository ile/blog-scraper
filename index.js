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
	merge = require('deepmerge'),
	db,
	domain,
	options = {
		title: 'div.contentContainer section.wide-article > article header h1',
		body: 'div.contentContainer section.wide-article > article div.article-body',
		comments: 'section.comment-list > section',
		time: 'div.contentContainer section.wide-article > article time',
		next: '.article-actions .continue-reading .next a'
	};

function init(dbName, options_) {
	db = mongo.db("mongodb://localhost:27017/" + dbName, {native_parser:true});
	db.bind('posts');

	if (options_) {
		options = merge(options, options_);
	}
}

function finish() {
	console.log('Done.');
	process.exit();
}
// get url contents (blog post)
function getContents(url) {
	console.log(url);

	if (!domain) {
		var parsed = URL.parse(url);
		domain = parsed.protocol+'//'+parsed.host;
	}

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
					title: $(options.title).html(),
					body: $(options.body).html(),
					comments: $(options.comments).html(),
					date: moment($(options.time).attr('datetime')).toDate()
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
					var next = $(options.next).first();

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



