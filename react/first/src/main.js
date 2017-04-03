import React from 'react';
import ReactDOM from 'react-dom';

window.addEventListener('load', main);

class Hello extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>{this.props.message}</div>;
  }
}

function main() {
  window.removeEventListener('load', main);
  const root = document.getElementById('root');
  ReactDOM.render(
    <Hello message="Hello!! Kin-iro Mosaic" />,
    root
  );
}
