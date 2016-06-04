import React from 'react';
import RegionView from './RegionView';

const SamplesList = ({ chosenSamples, image, sampleMarks,
                       onCommit, onCancel, onRemoveSample, onMarkChanged }) => (
  <section className="container">
    <div className="row" style={{ marginTop: '50px' }}>
      <form className="col s12">
        {
          chosenSamples.map((sample) => (
            <t key={sample.index}>
              <div className="divider"></div>
              <div className="row section">
                <div className="col s2 center">
                  <RegionView
                    image={image}
                    region={sample}
                  />
                </div>
                <div className="input-field col s2 center" style={{ maxWidth: '50px' }}>
                  <input
                    id={`sample-${sample.index}`}
                    type="text" limit="1"
                    onKeyPress={(e) => onMarkChanged(sample.index, e)}
                    value={sampleMarks.has(sample.index) ? sampleMarks.get(sample.index) : ''}
                  />
                  <label
                    htmlFor={`sample-${sample.index}`}
                    className={sampleMarks.has(sample.index) ? 'active' : ''}
                  >
                    Symbol
                  </label>
                </div>
                <div className="col s6">
                  <pre>{JSON.stringify(sample.features)}</pre>
                </div>
                <div className="col s2 right-align">
                  <a
                    href="#"
                    onClick={() => onRemoveSample(sample.index)}
                    className="material-icons np-samplesform-delete-icon"
                  >
                    delete
                  </a>
                </div>
              </div>
            </t>
          ))
        }
      </form>
    </div>
    <br />
    <div className="row">
      <div className="col s12 right-align">
        <a className="waves-effect waves-light btn-flat" onClick={onCancel}>
          Back to image
        </a>
        <a className="waves-effect waves-light btn" onClick={onCommit}>
          <i className="material-icons right">send</i>
          Commit
        </a>
      </div>
    </div>
  </section>
);

SamplesList.propTypes = {
  chosenSamples: React.PropTypes.array,
  sampleMarks: React.PropTypes.object,
  image: React.PropTypes.object,
  onCommit: React.PropTypes.func,
  onCancel: React.PropTypes.func,
  onRemoveSample: React.PropTypes.func,
  onMarkChanged: React.PropTypes.func
};

export default SamplesList;
