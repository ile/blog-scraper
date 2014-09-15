blog-scraper
================

A general blog scraper.

Saves data to mongodb. 

## install

`npm install blog-scraper`
 
## usage

### from the command line
`./scrape <url> [db-name]`

- `url` should be the url to the first post. On that blog page should be a link to the next post.
- db-name is `blog-scraper` by default.

### as a Nodejs module

```javascript
var scraper = require('blog-scraper');
scraper.init('db-name', options);
```

options has these defaults, any of which can be changed by passing an object to scraper.init():

```javascript
options = {
	title: 'div.contentContainer section.wide-article > article header h1',
	body: 'div.contentContainer section.wide-article > article div.article-body',
	comments: 'section.comment-list > section',
	time: 'div.contentContainer section.wide-article > article time',
	next: '.article-actions .continue-reading .next a'
}
```

Note: the time extraction expects a `datetime` attribute at the selector's target element.
