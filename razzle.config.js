'use strict';

module.exports = {
  modify(config, { target, dev }, webpack) {
    config.resolve.extensions = config.resolve.extensions.concat([
      '.ts',
      '.tsx',
    ]);

    // Safely locate Babel-Loader in Razzle's webpack internals
    const babelLoader = config.module.rules.findIndex(
      rule => rule.options && rule.options.babelrc
    );

    // Get the correct `include` option, since that hasn't changed.
    // This tells Razzle which directories to transform.
    const { include } = config.module.rules[babelLoader];

    // Declare our TypeScript loader configuration
    const tsLoader = {
      include,
      test: /\.tsx?$/,
      loader: 'ts-loader',
      options: {
        // this will make errors clickable in `Problems` tab of VSCode
        visualStudioErrorFormat: true,
      },
    };

    // Fully replace babel-loader with ts-loader
    config.module.rules[babelLoader] = tsLoader;

    return config;
  },
};
