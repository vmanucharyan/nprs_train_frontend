/* eslint-disable no-console */

import React from 'react';
import { render } from 'react-dom';
import Root from './containers/Root';

window.React = React;

render(
  <Root />,
  document.getElementById('content')
);
