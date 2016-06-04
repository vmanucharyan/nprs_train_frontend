import work from 'webworkify';
import request from 'superagent';

/*
 * action types
 */
export const REQUEST_IMAGE = 'LOAD_IMAGE';
export const RECEIVE_IMAGE = 'LOAD_IMAGE_RESULT';

export const REQUEST_TRACE = 'LOAD_TRACE_REQUEST';
export const RECEIVE_TRACE = 'LOAD_TRACE_RESULT';

export const CHOOSE_SAMPLE = 'CHOOSE_SAMPLE';
export const UNCHOOSE_SAMPLE = 'UNCHOOSE_SAMPLE';

export const SELECT_SAMPLE = 'SELECT_SAMPLE';
export const SELECT_SAMPELS = 'SELECT_SAMPELS';
export const UNSELECT_SAMPLE = 'UNSELECT_SAMPLE';

export const MARK_SAMPLE = 'MARK_SAMPLE';

export const SELECT_POINT = 'SELECT_POINT';

export const GOTO_STATE = 'GOTO_STATE';

export const POST_SAMPLES_START = 'POST_SAMPLES_START';
export const POST_SAMPLES_END = 'POST_SAMPLES_END';

export const SHOW_ERRORS = 'SHOW_ERRORS';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';

/**
 * Other constants
 */
export const AppState = {
  LOADING: 'LOADING',
  COLLECT_SAMPLES: 'COLLECT_SAMPLES',
  REVIEW_SAMPLES: 'REVIEW_SAMPLES',
  ERROR: 'ERROR'
};

export function requestTrace(sourceImageId) {
  return {
    type: REQUEST_TRACE,
    sourceImageId
  };
}

export function receiveTrace(trace) {
  return {
    type: RECEIVE_TRACE,
    trace
  };
}

export function fetchTrace(sourceImageId) {
  return (dispatch) => {
    dispatch(requestTrace(sourceImageId));

    const oReq = new XMLHttpRequest();
    oReq.open('GET', `/api/source_images/${sourceImageId}/trace_file`, true);
    oReq.responseType = 'arraybuffer';
    oReq.onload = () => {
      const worker = work(require('./workers/LoadTraceWorker.js')); // eslint-disable-line max-len, global-require

      worker.postMessage([oReq.response]);

      worker.onmessage = (e) => {
        const parsed = JSON.parse(e.data[0]);
        dispatch(receiveTrace({
          regions: parsed.regions,
          regionsMap: parsed.regions_map
        }));
      };
    };

    oReq.send();
  };
}

/*
 * action creators
 */
export function requestImage(sourceImageId) {
  return {
    type: REQUEST_IMAGE,
    sourceImageId
  };
}

/*
 * action creators
 */

export function showErrors(errors) {
  return {
    type: SHOW_ERRORS,
    errors
  };
}

export function clearErrors() {
  return {
    type: CLEAR_ERRORS
  };
}

export function receiveImage(image, imageId, lockId, errors) {
  return {
    type: RECEIVE_IMAGE,
    image,
    imageId,
    lockId,
    errors
  };
}

export function fetchImage() {
  return (dispatch) => {
    dispatch(requestImage());
    request
      .get('/api/source_images/unprocessed/first')
      .set('Accept', 'application/json')
      .end((imageErr, imageRes) => {
        console.log('received image');
        console.log(imageRes);
        // fetch unprocessed image
        if (imageErr) {
          dispatch(receiveImage(null, -1, -1, ['failed to fetch image']));
          return;
        }

        if (!imageRes || imageRes.status !== 200) {
          dispatch(receiveImage(null, -1, -1, ['failed to fetch image']));
          return;
        }

        const sourceImage = imageRes.body;

        // lock image
        request
          .put(`/api/source_images/${sourceImage.id}/lock`)
          .end((lockErr, lockRes) => {
            console.log('received lock');
            console.log(lockRes);

            if (!lockRes || lockRes.status !== 200) {
              dispatch(receiveImage(null, -1, -1, ['failed to lock image']));
              return;
            }

            const lock = lockRes.body;
            const imageUrl = sourceImage.picture.original;
            const img = new Image;
            img.onload = () => {
              dispatch(receiveImage(img, sourceImage.id, lock.lock_id));
              dispatch(fetchTrace(sourceImage.id));
            };
            img.src = imageUrl;
          });
      });
  };
}

export function chooseSample(regionIdx) {
  return {
    type: CHOOSE_SAMPLE,
    regionIdx
  };
}

export function unchooseSample(regionIdx) {
  return {
    type: UNCHOOSE_SAMPLE,
    regionIdx
  };
}

export function selectSample(regionIdx) {
  return {
    type: SELECT_SAMPLE,
    regionIdx
  };
}

export function selectSamples(indexes) {
  return {
    type: SELECT_SAMPELS,
    indexes
  };
}

export function unselectSample(regionIdx) {
  return {
    type: UNSELECT_SAMPLE,
    regionIdx
  };
}

export function selectPoint(point) {
  return {
    type: SELECT_POINT,
    point
  };
}

export function goToState(newState) {
  return {
    type: GOTO_STATE,
    newState
  };
}

export function postSamplesStart(samples) {
  return {
    type: POST_SAMPLES_START,
    samples
  };
}

export function postSamplesEnd(res, err) {
  return {
    type: POST_SAMPLES_END,
    res,
    err
  };
}

export function commitSamples(samples, marks) {
  return (dispatch, getState) => {
    const state = getState();

    if (!state.chosenSamples.subtract(state.sampleMarks.keys()).isEmpty()) {
      dispatch(postSamplesEnd(null, 'Not all samples marked'));
      return;
    }

    /* eslint-disable no-underscore-dangle */
    const payload = {
      samples: samples.map((s) => Object.assign({}, s, {
        bounds: {
          x: s.bounds._field0.x,
          y: s.bounds._field0.y,
          width: s.bounds._field1.x - s.bounds._field0.x,
          height: s.bounds._field1.y - s.bounds._field0.y
        },
        symbol: marks.get(s.index),
        cser_light_features: s.features
      })),
      lock_id: state.lockId
    };
    /* eslint-enable no-underscore-dangle */

    dispatch(postSamplesStart(samples));
    request
      .post(`/api/source_images/${state.imageId}/symbol_samples`)
      .send(payload)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (res.status === 200 || res.status === 201) {
          dispatch(postSamplesEnd(res.body, null));
          dispatch(fetchImage());
        } else {
          dispatch(postSamplesEnd(null, res.body.message));
        }
      });
  };
}

export function markSample(sampleIdx, symbol) {
  return {
    type: MARK_SAMPLE,
    sampleIdx,
    symbol
  };
}
