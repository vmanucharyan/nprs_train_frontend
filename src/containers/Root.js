import React from 'react';
import { Provider } from 'react-redux';
import configureStore from '../Store';
import App from './App';
import request from 'superagent';

import { fetchImage } from '../Actions';

const store = configureStore();

store.dispatch(fetchImage());

request
.get('/api/ping')
.set('Accept', 'application/javascript')
.end((err, res) => {
  if (res && res.status === 401) {
    window.location = '/users/sign_in';
  }
});

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default Root;
