[![NPM version](https://img.shields.io/npm/v/@webacad/angular-tools.svg?style=flat-square)](https://www.npmjs.com/package/@webacad/angular-tools)
[![Build Status](https://img.shields.io/travis/Web-ACAD/js-angular-tools.svg?style=flat-square)](https://travis-ci.org/Web-ACAD/js-angular-tools)

# WebACAD/AngularTools

Ready to use tool set for angular applications

## Includes

* Express server
* Handlebars template engine for server
* HMR (hot module replacement)
* Webpack
    + Development/production modes
    + Multiple entries
    + Hashed chunks
    + @ngtools/webpack + AngularCompilerPlugin
    + file-loader for fonts
    + webpack.DefinePlugin
* Sass + PostCSS

## Installation

```bash
$ npm install --save rxjs@^5.5.0
$ npm install --save @angular/core@^5.0
$ npm install --save @angularclass/hmr
$ npm install --save @webacad/angular-tools
```

or with yarn

```bash
$ yarn add rxjs@^5.5.0
$ yarn add @angular/core^5.0
$ yarn add @angularclass/hmr
$ yarn add @webacad/angular-tools
```

## About documentation

**All examples are written in typescript.**

## Configure webpack

**webpack.config.ts:**

```typescript
import {EnvironmentType} from '@webacad/angular-tools';
import {webpackConfigFactory} from '@webacad/angular-tools/webpack';
import * as webpack from 'webpack';

const environment: EnvironmentType = 'development';    // possible values are "development" or "production"

function createWebpackConfig(): webpack.Configuration
{
    return webpackConfigFactory(environment, {
        root: __dirname,
        distDir: '/path/to/public/dist/directory',
        publicPath: '/url/path',
        hmr: true,
        sourceMaps: true,
        angular: {
            entryModule: './app.module#AppModule',
        },
        postcss: {
            config: '/path/to/postcss/config.js',
        },
        webpack: {
            analyze: true,
            fonts: {
                outputPath: 'relative/path/to/publicPath',
                publicPath: '/url/path',
            },
            plugins: {
                define: {
                    'process.env': {
                        'NODE_ENV': `'${environment}'`,
                    },
                },
            },
            entry: {
                polyfills: './app/polyfills.ts',
                app: './app/main.ts',
                styles: './styles/index.scss',
            },
        },
    });
}

export default createWebpackConfig;
```

## Configure express server

**server/server.ts:**

```typescript
import {EnvironmentType} from '@webacad/angular-tools';
import {createServer} from '@webacad/angular-tools/expressjs';
import createWebpackConfig from '../webpack.config';
import * as path from 'path';

const environment: EnvironmentType = 'development';

createServer(environment, createWebpackConfig(), {
    index: path.join(__dirname, 'views', 'index.handlebars'),
    port: 8080,
    hmr: true,
    staticPaths: {
        '/public/images': '/path/to/public/images',    // using express.static
    },
    parameters: {    // parameters passed to handlebar templates

    },
});
```

**server/views/index.handlebars:**

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <base href="/">

        {{#if production}}
            <link rel="stylesheet" href="{{assets 'styles/css'}}">
        {{/if}}
    </head>
    <body>
        <my-app>Loading...</my-app>

        <script src="{{asset 'manifest/js'}}"></script>

        {{#if hmr}}
            <script src="{{asset 'hmr/js'}}"></script>
        {{/if}}

        {{#if development}}
            <script src="{{asset 'styles/js'}}"></script>
        {{/if}}

        <script src="{{asset 'polyfills/js'}}"></script>
        <script src="{{asset 'app/js'}}"></script>
    </body>
</html>
```

### Build-in template variables

* `production`: True for production environment
* `development`: True for development environment
* `hmr`: True if hot module replacement is allowed

### Assets

**Styles/css:**

Automatically generated css file which should be used only in production environment.

**Manifest/js:**

Automatically generated manifest file.

**Hmr/js:**

Automatically generated hmr configuration (only if hmr is allowed). 

**Styles/js:**

Automatically generated js file with styles which should be used only in development environment.

**Polyfills/js:**

Your polyfills.ts entry file.

**App/js:**

Your app.ts entry file.

## Main.ts file

```typescript
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';
import {hmrBootstrap} from '@webacad/angular-tools/hmr';

import {AppModule} from './app.module';

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (process.env.NODE_ENV === 'production') {
    enableProdMode();
    bootstrap();

} else {
    Error['stackTraceLimit'] = Infinity;
    require('zone.js/dist/long-stack-trace-zone');

    if (module['hot']) {
        hmrBootstrap(module, bootstrap);
    } else {
        bootstrap();
    }
}
```

## Update scripts in package.json

**package.json:**

```json
{
    "scripts": {
        "build": "webpack",
        "start": "ts-node server/server.ts"
    }
}
```
