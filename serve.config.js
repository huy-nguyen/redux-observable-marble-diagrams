module.exports = {
  // Disable hot reloading because of this bug:
  // https://github.com/webpack/webpack/issues/6642
  // Waiting for this solution:
  // https://github.com/webpack/webpack/issues/6525
  hot: false,
  dev: {
    stats: 'errors-only',
  },
};
