# Paroisses du Pays de Châteaubriant

This repository is used to create and manage the site paroisseschateaubriant.fr
It uses [Gulp](https://gulpjs.com) to serve local server for development, build server-side rendering (SSR) and server-side generation (SSG) HTML pages, concatenate and minify CSS and JS.

## Start a new project 

Create a project:

```bash
npm init
```

Install `gulp` :

```bash
npm install -g gulp
```

Install all the necesary Gulp plugins:

```bash
npm install --save-dev gulp gulp-concat gulp-uglify gulp-sass gulp-uglify gulp-sourcemaps through2 gulp-html-extend browser-sync path
```

Organize your files and folders as in this project.

Create gulpfile.js at the root of the project like the one present in this repository.

## Installation

Install all dependencies

```bash
npm i
```

## Development

If you use WSL on Windows, ensure to work only on WSL (repository included) to be more efficient (quick and live reloading working)

Launch `gulp` to serve you local development server and build automagically the final files to serve in the Production environment.

## SSR

Install [Node](https://nodejs.org/) (at least version 8) and [npm](https://www.npmjs.com/). Run

```
$ npm install
```

Install extra libraries

```
sudo apt install libxss1 libxdamage1 libnss3 lipbcups2 libasound2 libatk-bridge2.0-0 libgtk-3-0
```

## Update search index

```
node plugins/netlify-plugin-lunr-indexer/src/generate-index.js
```

# Optimize images

```
find . -type f \( -iname \*.jpg -o -iname \*.JPG -o -iname \*.jpeg -o -iname \*.JPEG \) -exec jpegoptim -m100 -o --strip-all {} \;
find . -type f \( -iname \*.png -o -iname \*.PNG \) -exec optipng -force -o7 -clobber -strip all {} \;
```