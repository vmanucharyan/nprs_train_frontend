import React from 'react';
import ImageUtils from '../ImageUtils';

class RegionView extends React.Component {
  componentDidMount() {
    this.drawRegion(this.props);
  }

  componentWillReceiveProps(props) {
    this.drawRegion(props);
  }

  drawRegion(props) {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');

    const r = props.region;

    /* eslint-disable no-underscore-dangle */
    const rect = {
      x: r.bounds._field0.x,
      y: r.bounds._field0.y,
      width: r.bounds._field1.x - r.bounds._field0.x,
      height: r.bounds._field1.y - r.bounds._field0.y
    };
    /* eslint-enable no-underscore-dangle */

    // get image data
    ctx.drawImage(
      props.image,
      rect.x, rect.y,
      rect.width, rect.height,
      0, 0,
      rect.width, rect.height
    );
    const imageData = ctx.getImageData(0, 0, rect.width, rect.height);
    const thresData = ctx.createImageData(rect.width, rect.height);
    ImageUtils.threshold(imageData, thresData, props.region.thres);

    const nc = document.createElement('canvas');
    nc.width = thresData.width;
    nc.height = thresData.height;
    nc.getContext('2d').putImageData(thresData, 0, 0);

    const ar = nc.width / nc.height;

    canvas.width = canvas.height * ar;

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw thresholded image
    ctx.drawImage(
      nc,
      0, 0, nc.width, nc.height,
      5, 5, (canvas.height * ar) - 10, canvas.height - 10
    );
  }

  render() {
    return (
      <canvas
        ref="canvas"
        width="40" height="60"
        className={this.props.className || ''}
        onClick={this.props.onClick}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      />
    );
  }
}

RegionView.propTypes = {
  image: React.PropTypes.object,
  region: React.PropTypes.object,
  className: React.PropTypes.string,
  onClick: React.PropTypes.func,
  onMouseEnter: React.PropTypes.func,
  onMouseLeave: React.PropTypes.func
};

export default RegionView;
