const React = require('react');

function Link({ children, href, ...props }) {
  return React.createElement('a', { href, ...props }, children);
}

module.exports = {
  __esModule: true,
  default: Link
}; 