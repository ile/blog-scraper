blog-scraper
================

A general blog scraper.

Saves data to mongodb, db: blog-scraper, collection: posts
 
## usage

node index.js url

`url` should be the url to the first post. On that blog page should be a link to the next post.

Edit the selectors in `index.js` for *title*, *body*, *comments* and the *next url*!
