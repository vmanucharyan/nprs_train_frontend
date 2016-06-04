/* eslint-disable react/jsx-no-bind*/

import React from 'react';

class ImageView extends React.Component {
  constructor(props) {
    super(props);
    this.onImageClick.bind(this);
    this.state = {
      dragEntered: false,
      dragEnterPos: { x: -1, y: -1 },
      imagePos: { x: 0, y: 0 },
      zoom: 1.0
    };
  }

  componentDidMount() {
    this.updateImage(this.props.image);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.image !== this.props.image) {
      this.updateImage(newProps.image);
    }

    if ((newProps.chosenRegions !== this.props.chosenRegions) ||
        (newProps.selectedRegion !== this.props.selectedRegion)) {
      this.redrawImage(
        this.state.imagePos,
        this.state.zoom,
        newProps.chosenRegions,
        newProps.selectedRegion
      );
    }
  }

  onImageClick(e) {
    const p = { x: e.clientX, y: e.clientY };
    const tp = this.mapPointToImageCoords(p);

    this.props.onImageClick({
      texCoordX: Math.round(tp.x),
      texCoordY: Math.round(tp.y)
    });
  }

  onImageMouseDown(e) {
    if (this.state.dragEntered) {
      return;
    }

    this.setState({
      dragEnterPos: { x: e.pageX, y: e.pageY }
    });
  }

  onImageMouseUp(e) {
    const ep = this.state.dragEnterPos;

    if (this.state.dragEntered) {
      this.onImageDragLeave(e);
    }

    this.setState({
      dragEntered: false,
      dragEnterPos: { x: -1, y: -1 }
    });

    if (e.pageX === ep.x && e.pageY === ep.y) {
      this.onImageClick(e);
    }
  }

  onImageMouseMove(e) {
    const ep = this.state.dragEnterPos;

    const p = this.mapPointToImageCoords({ x: e.clientX, y: e.clientY });
    if (this.props.onMouseMove) {
      this.props.onMouseMove({
        texCoordX: Math.round(p.x), texCoordY: Math.round(p.y)
      });
    }

    if (!this.state.dragEntered && (ep.x !== -1 && ep.y !== -1)) {
      this.setState({ dragEntered: true });
      this.onImageDragEntered(e);
    } else if (this.state.dragEntered && (ep.x !== -1 && ep.y !== -1)) {
      this.onImageDrag(e);
    }
  }

  onImageDragEntered(e) {
    this.setState({
      dragEnterPos: { x: e.clientX, y: e.clientY }
    });
  }

  onImageDrag(e) {
    const ep = this.state.dragEnterPos;
    const offset = { x: e.pageX - ep.x, y: e.pageY - ep.y };

    const imagePos = {
      x: this.state.imagePos.x + offset.x,
      y: this.state.imagePos.y + offset.y
    };

    this.redrawImage(imagePos);
  }

  onImageDragLeave(e) {
    const ep = this.state.dragEnterPos;
    const offset = { x: ep.x - e.pageX, y: ep.y - e.pageY };
    this.setState({
      imagePos: {
        x: this.state.imagePos.x - offset.x,
        y: this.state.imagePos.y - offset.y
      }
    });
  }

  onImageWheel(e) {
    e.preventDefault();
    e.stopPropagation();

    const clientPos = { x: e.clientX, y: e.clientY };

    let newZoom = this.state.zoom - (e.deltaY / this.refs.canvas.height);
    newZoom = Math.max(0.1, newZoom);
    newZoom = Math.min(10.0, newZoom);

    const m1 = this.mapPointToImageCoords(clientPos, newZoom);
    const m2 = this.mapPointToImageCoords(clientPos, this.state.zoom);

    const newPos = {
      x: this.state.imagePos.x - ((m2.x - m1.x) * newZoom),
      y: this.state.imagePos.y - ((m2.y - m1.y) * newZoom)
    };

    this.setState({
      imagePos: newPos,
      zoom: newZoom
    });

    this.redrawImage(newPos, newZoom);
  }

  updateImage(img) {
    const canvas = this.refs.canvas;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const zh = canvas.height / img.height;
    const zw = canvas.width / img.width;
    const z = Math.min(zh, zw);

    const p = {
      x: Math.abs(canvas.width - img.width * z) * 0.5,
      y: Math.abs(canvas.height - img.height * z) * 0.5
    };

    this.setState({ zoom: z, imagePos: p });

    this.redrawImage(p, z);
    canvas.onresize = () => this.redrawImage();
  }

  redrawImage(pos, zoom, chosenRegions_, selectedRegion) {
    const chosenRegions = chosenRegions_ || this.props.chosenRegions;

    const canvas = this.refs.canvas;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const ctx = canvas.getContext('2d');
    const img = this.props.image;

    const imgPos = pos || this.state.imagePos;

    ctx.fillStyle = '#202020';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const z = zoom || this.state.zoom;

    ctx.drawImage(
      img,
      0, 0,
      img.width, img.height,
      imgPos.x, imgPos.y,
      (img.width * z), (img.height * z)
    );

    this.redrawRegions(chosenRegions, selectedRegion, z, imgPos);
  }

  redrawRegions(regions_, selectedRegion_, zoom_, imagePos_) {
    const regions = regions_;
    const zoom = zoom_ || this.state.zoom;
    const imagePos = imagePos_ || this.state.imagePos;

    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');

    const drawRegion = (r, style) => {
      /* eslint-disable no-underscore-dangle,  */
      const b = r.bounds;
      const x = b._field0.x - 1;
      const y = b._field0.y - 1;
      const width = b._field1.x - b._field0.x + 2;
      const height = b._field1.y - b._field0.y + 2;

      ctx.beginPath();
      ctx.lineWidth = '1';
      ctx.strokeStyle = style;
      ctx.rect(x, y, width, height);
      ctx.stroke();
      /* esline-enable no-underscore-dangle */
    };

    ctx.transform(zoom, 0, 0, zoom, imagePos.x, imagePos.y);
    regions.forEach((r) => drawRegion(r, 'red'));

    if (selectedRegion_) {
      drawRegion(selectedRegion_, 'teal');
    }
  }

  mapPointToImageCoords(p, zoom, imagePos) {
    function clientPos(canvas) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: p.x - rect.left,
        y: p.y - rect.top
      };
    }

    const canvas = this.refs.canvas;
    const canvasPos = clientPos(canvas);

    const z = zoom || this.state.zoom;
    const pos = imagePos || this.state.imagePos;

    return {
      x: (canvasPos.x - pos.x) / z,
      y: (canvasPos.y - pos.y) / z
    };
  }

  mapImageCoordToCanvas(p) {
    return {
      x: p.x * this.state.zoom + this.state.imagePos.x,
      y: p.y * this.state.zoom + this.state.imagePos.y
    };
  }

  render() {
    return (
      <div className="np-image-container np-fullscreen">
        <canvas
          ref="canvas"
          width={this.winWidth}
          height={this.state.winHeight}
          className={`np-fullscreen ${this.props.className}`}
          disabled={this.props.disabled}
          onMouseDown={this.onImageMouseDown.bind(this)}
          onMouseUp={this.onImageMouseUp.bind(this)}
          onMouseMove={this.onImageMouseMove.bind(this)}
          onWheel={this.onImageWheel.bind(this)}
        ></canvas>
      </div>
    );
  }
}

ImageView.propTypes = {
  className: React.PropTypes.string,
  onImageClick: React.PropTypes.func,
  disabled: React.PropTypes.bool,
  image: React.PropTypes.object,
  chosenRegions: React.PropTypes.array,
  selectedRegion: React.PropTypes.object,
  onMouseMove: React.PropTypes.func
};

export default ImageView;
