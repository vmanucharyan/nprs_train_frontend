import React from 'react';
import { connect } from 'react-redux';
import SampleSelector from './SampleSelector';
import Preloader from '../components/Preloader';
import SamplesListContainer from './SamplesListContainer';
import { AppState, clearErrors } from '../Actions';

const Materialize = window.Materialize;

class App extends React.Component {
  onErrors() {
    const { dispatch, errors } = this.props;
    errors.forEach(e => Materialize.toast(e, 5000, '', () => dispatch(clearErrors())));
  }

  render() {
    const { appState, image, trace, chosenSamples, errors } = this.props;

    if (appState !== AppState.ERROR && errors.length > 0) {
      this.onErrors();
    }

    switch (appState) {
      case AppState.LOADING:
        return (<Preloader />);

      case AppState.COLLECT_SAMPLES:
        return (
          <section className="np-trace-body np-fullscreen">
            <SampleSelector />
          </section>
        );

      case AppState.REVIEW_SAMPLES:
        return (
          <SamplesListContainer
            image={image}
            trace={trace}
            chosenSamples={chosenSamples.toArray()}
          />
        );

      case AppState.ERROR:
        return (
          <div className="container">
            <h1>Something went wrong...</h1>
            {
              errors.map((e, index) => (<p key={index}>{e}</p>))
            }
            <p>Please, try to reload this page</p>
          </div>
        );

      default:
        return (
          <div className="container">
            <p>Please, try to reload this page</p>
          </div>
        );
    }
  }
}

App.propTypes = {
  dispatch: React.PropTypes.func,
  appState: React.PropTypes.string,
  image: React.PropTypes.object,
  trace: React.PropTypes.object,
  chosenSamples: React.PropTypes.object,
  errors: React.PropTypes.array
};

function mapStateToProps(state) {
  return {
    appState: state.appState,
    image: state.image,
    trace: state.trace,
    chosenSamples: state.chosenSamples,
    errors: state.errors
  };
}

export default connect(mapStateToProps)(App);
