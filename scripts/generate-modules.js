// const browserify = require("browserify");
const fs = require("fs");
process.env.NODE_ENV = "development";
const path = require("path");
const camelCase = require('lodash.camelcase');
const webpack = require("webpack");
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
const postcssNormalize = require('postcss-normalize');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

process.on('unhandledRejection', err => {
  throw err;
});

const getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    require.resolve('style-loader'),
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebook/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
          // Adds PostCSS Normalize as the reset css with default options,
          // so that it honors browserslist config in package.json
          // which in turn let's users customize the target behavior as per their needs.
          postcssNormalize(),
        ],
        sourceMap: true,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    // preProcesor has no options, is loader module name
    if (preProcessor.loader === undefined) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: false,
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
          },
        }
      );
    } else {
      loaders.push(preProcessor);
    }
  }
  return loaders;
};

function handleExec(source, destination) {
  const formattedSourcePath = path.resolve(process.cwd(), source);
  const pkgFile = fs.readFileSync(formattedSourcePath).toString();
  const pkgJson = JSON.parse(pkgFile);
  const { dependencies: IMODELJS_LIBS, alias, externalDependencies } = pkgJson;

  if (!IMODELJS_LIBS) {
    throw Error(source + " does not contain dependencies to parse.");
  }

  const IMJS_DEPS = [];
  const organizedLibs = [];

  const orderPeerDeps = (dep, depArray) => {
    if (depArray.includes(dep)) {
      return;
    }

    let pkgJson;

    try {
      if (dep.startsWith(".")) {
        const completed = path.join(process.cwd(), "package.json");
        const pkgFileUri = require.resolve(completed);

        if (pkgFileUri) {
          const pkgFile = fs.readFileSync(pkgFileUri).toString();
          pkgJson = JSON.parse(pkgFile);
        }

      } else {
        const paths = dep.split("/");
        let pathVal = "";

        for (const pathPart of paths) {
          pathVal = path.join(pathVal, pathPart)
          try {
            const pkgFileUri = require.resolve(path.join(pathVal, "package.json"), { paths: [process.cwd()] });

            if (pkgFileUri) {
              const pkgFile = fs.readFileSync(pkgFileUri).toString();
              pkgJson = JSON.parse(pkgFile);
              break;
            }
          } catch {
            continue;
          }
        }
      }

      const { peerDependencies, dependencies, version } = pkgJson;

      if (IMODELJS_LIBS[dep]) {
        IMODELJS_LIBS[dep] = version;
      }

      let depDependencies = [];

      if (peerDependencies) {
        const deps = Object.keys(peerDependencies);
        depDependencies.push(...deps)
        deps.forEach((val) => {
          if (!IMJS_DEPS.includes(val) && !IMODELJS_LIBS[val]) {
            IMJS_DEPS.push(val);
          }
        })
      }
      if (dependencies) {
        depDependencies.push(...Object.keys(dependencies).filter((val) => IMODELJS_LIBS[val]))
      }

      for (const peerDep of depDependencies) {
        if (!depArray.includes(peerDep)) {
          orderPeerDeps(peerDep, depArray)
        }
      }

      depArray.push(dep);
    } catch (err) {
      console.error(["Error occurred attempting to order dependencies: " + dep, err].join("\n"))
    }
  }

  for (const dep in IMODELJS_LIBS) {
    orderPeerDeps(dep, organizedLibs);
  }

  let shims = externalDependencies.reduce((prev, cur) => {
    if (cur.dependency && cur.global) {
      prev[cur.dependency] = cur.global;
    }
    return prev;
  }, {});

  shims = organizedLibs.reduce((prev, cur) => {
    if (IMJS_DEPS.includes(cur)) {
      prev[cur] = cur;
    } else if (alias && alias[cur]) {
      prev[cur] = camelCase(alias[cur]);
    } else {
      prev[cur] = camelCase(cur);
    }
    return prev;
  }, shims);

  const promises = [];

  for (const dep of organizedLibs) {
    if (dep.startsWith("@types") || !IMODELJS_LIBS[dep] || IMODELJS_LIBS[dep] === "*") {
      continue;
    }

    promises.push(new Promise((resolve, reject) => {
      const entry = dep;
      const externals = { ...shims };
      const library = externals[dep];
      delete externals[dep];

      const version = IMODELJS_LIBS[dep].split(".").slice(0, 1).concat("x").join(".");

      let depName = dep;
      if (alias && alias[dep]) {
        depName = alias[dep];
      }

      const pathVal = path.resolve(process.cwd(), destination, depName, version);
      const fileName = "index.js";

      const compiler = webpack({
        entry: entry,
        mode: "development",
        devtool: "source-map",
        output: {
          path: pathVal,
          filename: fileName,
          libraryTarget: "global",
          library,
          globalObject: 'this',
        },
        resolve: {
          extensions: ['.tsx', '.ts', '.js'],
        },
        externals,
        optimization: {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                  keep_classnames: true,
                  keep_fnames: true,
                },
                mangle: {
                  safari10: true,
                  // Mangling classnames breaks reflection used in iModel.js
                  keep_classnames: true,
                  keep_fnames: true,
                },
                // Added for profiling in devtools
                keep_classnames: false,
                keep_fnames: false,
                output: {
                  ecma: 5,
                  comments: false,
                  // Turned on because emoji and regex is not minified properly using default
                  // https://github.com/facebook/create-react-app/issues/2488
                  ascii_only: true,
                },
              },
              sourceMap: true,
            }),
            // This is only used in production mode
            new OptimizeCSSAssetsPlugin({
              cssProcessorOptions: {
                parser: safePostCssParser,
                map: {
                  inline: false,
                  annotation: true,
                }
              },
              cssProcessorPluginOptions: {
                preset: ['default', { minifyFontValues: { removeQuotes: false } }],
              },
            }),
          ]
        },
        module: {
          strictExportPresence: true,
          rules: [
            { parser: { requireEnsure: false } },
            {
              test: /\.(ts|tsx)$/,
              exclude: /node_modules|@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                presets: [
                  [
                    require.resolve('babel-preset-react-app'),
                    {
                      runtime: 'automatic',
                    },
                  ],
                ],
                babelrc: false,
                configFile: false,
                cacheIdentifier: getCacheIdentifier(
                  'production',
                  [
                    'babel-plugin-named-asset-import',
                    'babel-preset-react-app',
                    'react-dev-utils',
                    'react-scripts',
                  ]
                ),
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                compact: true,
              },
            },
            // {
            //   test: /\.(ts)x?$/,
            //   use: {
            //     loader: require.resolve('babel-loader'),
            //     options: {
            //       babelrc: false,
            //       configFile: false,
            //       compact: false,
            //       presets: [
            //         "@babel/preset-env",
            //         "@babel/preset-react",
            //         "@babel/preset-typescript",
            //       ],
            //       cacheDirectory: true,
            //       cacheCompression: false,
            //       cacheIdentifier: getCacheIdentifier(
            //         'production',
            //         [
            //           'babel-plugin-named-asset-import',
            //           'babel-preset-react-app',
            //           'react-dev-utils',
            //           'react-scripts',
            //         ]
            //       ),
            //       sourceMaps: true,
            //       inputSourceMap: true,
            //     },
            //   },
            // },
            {
              // iModel.js Changes
              // always use source-map-loader and use strip-assert-loader on production builds;
              test: /\.js$/,
              enforce: 'pre',
              use: [require.resolve('source-map-loader')],
              exclude: /react-data-grid\.js/,
            },
            {
              oneOf: [
                {
                  test: /\.(js|mjs)$/,
                  exclude: /@babel(?:\/|\\{1,2})runtime/,
                  loader: require.resolve('babel-loader'),
                  options: {
                    babelrc: false,
                    configFile: false,
                    compact: false,
                    presets: [
                      [
                        require.resolve('babel-preset-react-app/dependencies'),
                        { helpers: true },
                      ],
                    ],
                    cacheDirectory: true,
                    cacheCompression: false,
                    cacheIdentifier: getCacheIdentifier(
                      'production',
                      [
                        'babel-plugin-named-asset-import',
                        'babel-preset-react-app',
                        'react-dev-utils',
                        'react-scripts',
                      ]
                    ),
                    sourceMaps: true,
                    inputSourceMap: true,
                  },
                },
                {
                  test: cssRegex,
                  exclude: cssModuleRegex,
                  use: getStyleLoaders({
                    importLoaders: 1,
                    sourceMap: true
                  }),
                  sideEffects: true,
                },
                {
                  test: cssModuleRegex,
                  use: getStyleLoaders({
                    importLoaders: 1,
                    sourceMap: true,
                    modules: {
                      getLocalIdent: getCSSModuleLocalIdent,
                    },
                  }),
                },
                {
                  test: sassRegex,
                  exclude: sassModuleRegex,
                  use: getStyleLoaders(
                    {
                      importLoaders: 3,
                      sourceMap: true,
                    },
                    "sass-loader"
                  ),
                  sideEffects: true,
                },
                {
                  test: sassModuleRegex,
                  use: getStyleLoaders(
                    {
                      importLoaders: 3,
                      sourceMap: true,
                      modules: {
                        getLocalIdent: getCSSModuleLocalIdent,
                      },
                    },
                    "sass-loader"
                  ),
                },
                // iModel.js Change: Add support for SVG Sprites.
                {
                  test: /\.svg$/,
                  resourceQuery: /sprite/,
                  use: {
                    loader: require.resolve('svg-sprite-loader'),
                    options: {
                      symbolId: '[name]-[hash:6]',
                      runtimeCompat: true,
                      spriteFilename: 'sprite-[hash:6].svg',
                      publicPath: path.resolve(depName, version)
                    },
                  },
                },
                {
                  loader: require.resolve('file-loader'),
                  exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                  options: {
                    name: '[name].[hash:8].[ext]',
                    publicPath: path.join(depName, version).replace(/\\/g, "/"),
                  },
                },
                // ** STOP ** Are you adding a new loader?
                // Make sure to add the new loader(s) before the "file" loader.
              ].filter(Boolean),
            },
          ],
        },
        plugins: [
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          new webpack.EnvironmentPlugin({
            'NODE_ENV': "development",
          }),
        ]
      });

      compiler.run((err, stats) => {
        if (err) {
          reject(err);
        }
        resolve({ dependency: depName, version, fileName: path.join(pathVal, fileName) })
      });

    }));

  }

  return Promise.all(promises)
}

module.exports = handleExec;