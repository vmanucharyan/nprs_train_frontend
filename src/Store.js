import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Set, Map } from 'immutable';
import { AppState } from './Actions';
import teacherApp from './Reducers';

export const initialState = {
  imageId: -1,
  lock_id: null,
  loadingImage: true,
  loadingTrace: true,
  image: null,
  trace: null,
  selectedSamples: new Set(),
  chosenSamples: new Set(),
  sampleMarks: new Map(),
  pointSamples: [],
  appState: AppState.LOADING,
  errors: []
};

export default function configureStore() {
  return createStore(teacherApp, initialState, compose(
    applyMiddleware(thunk)
  ));
}
