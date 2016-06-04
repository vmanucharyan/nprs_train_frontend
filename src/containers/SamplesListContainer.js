import React from 'react';
import { connect } from 'react-redux';

import { unchooseSample, commitSamples, goToState, AppState, markSample } from '../Actions';

import SamplesList from '../components/SamplesList';

class SamplesListContainer extends React.Component {
  constructor(props) {
    super(props);

    this.onRemoveSample = this.onRemoveSample.bind(this);
    this.onCommit = this.onCommit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onMarkChanged = this.onMarkChanged.bind(this);
  }

  onRemoveSample(sampleIdx) {
    const { dispatch } = this.props;
    dispatch(unchooseSample(sampleIdx));
  }

  onCommit() {
    const { dispatch, chosenSamples, sampleMarks } = this.props;
    dispatch(commitSamples(chosenSamples, sampleMarks));
  }

  onMarkChanged(sampleIdx, e) {
    console.log('onMarkChanged');
    const { dispatch } = this.props;
    dispatch(markSample(sampleIdx, e.key.toUpperCase()));
  }

  onCancel() {
    const { dispatch } = this.props;
    dispatch(goToState(AppState.COLLECT_SAMPLES));
  }

  render() {
    const { chosenSamples, image, trace, sampleMarks } = this.props;

    return (
      <SamplesList
        chosenSamples={chosenSamples}
        image={image}
        trace={trace}
        sampleMarks={sampleMarks}
        onRemoveSample={this.onRemoveSample}
        onCancel={this.onCancel}
        onCommit={this.onCommit}
        onMarkChanged={this.onMarkChanged}
      />
    );
  }
}

SamplesListContainer.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  chosenSamples: React.PropTypes.array.isRequired,
  sampleMarks: React.PropTypes.object.isRequired,
  image: React.PropTypes.object.isRequired,
  trace: React.PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    chosenSamples: state.chosenSamples.map(sidx =>
      Object.assign({}, state.trace.regions[sidx], { index: sidx })
    )
    .toArray()
    .sort((a, b) => a.index - b.index),

    image: state.image,
    trace: state.trace,
    sampleMarks: state.sampleMarks
  };
}

export default connect(mapStateToProps)(SamplesListContainer);
