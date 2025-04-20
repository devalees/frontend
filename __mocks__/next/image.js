const React = require('react');

function Image(props) {
  const { src, alt, ...rest } = props;
  return React.createElement('img', { src, alt, ...rest });
}

module.exports = {
  __esModule: true,
  default: Image
}; 