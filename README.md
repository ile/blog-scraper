blog-scraper
================

A general blog scraper.

Saves data to mongodb. 

## install

`npm install blog-scraper`
 
## usage

`./scrape &lt;url&gt; [db-name]`

- `url` should be the url to the first post. On that blog page should be a link to the next post.
- db-name is `blog-scraper` by default.

Edit the selectors in `index.js` for *title*, *body*, *comments* and the *next url*!
