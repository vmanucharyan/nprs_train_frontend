/* eslint-disable no-console */

import * as Actions from './Actions';
import configureStore from './Store';

const store = configureStore();

console.log(store.getState());

store.subscribe(() =>
  console.log(store.getState())
);

store.dispatch(Actions.fetchImage(123));
store.dispatch(Actions.fetchTrace(51));
