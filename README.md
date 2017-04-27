# loop-sample

[[Build](https://circleci.com/gh/abatilo/loop-sample.svg?style=svg)](https://circleci.com/gh/abatilo/loop-sample)

Source for my Looplist Challenge.

This application has a defined endpoint that will scrape information from a provided url.
The routes are defined in `./index.js` and the code is split up such that we keep the scraping
logic for different sources separate from each other. This is important because the nature of
web scraping is that it's not very reliable, so we want to make it extremely easy to isolate and
modify the logic for different websites.

## Requirements:
- [x] Make the HTTP request to get the source
- [x] Find a way to parse out the title
- [x] Find a way to parse out the name
- [x] Find a way to parse out the image(s)
- [x] Find a way to parse out the product description
- [x] Refactor
- [x] Get code coverage

## For funsies?
- [ ] Parse out the comments
- [ ] Run sentiment analysis on the comments
- [ ] Run image captioning over the images
