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
npm install --save-dev gulp gulp-concat gulp-uglify gulp-sass gulp-inject-file gulp-html-extend browser-sync
```

Organize your files and folders as in this project.

Create gulpfile.js at the root of the project like the one present in this repository.

## Installation

Install all dependencies

```bash
npm i
```

## Development

Launch `gulp` to serve you local development server and build automagically the final files to serve in the Production environment.