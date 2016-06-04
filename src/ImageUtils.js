/* eslint-disable no-param-reassign */

class ImageUtils {
  static threshold(src, dest, thres) {
    for (let i = 0; i < src.data.length; i += 4) {
      const r = src.data[i + 0];
      const g = src.data[i + 1];
      const b = src.data[i + 2];
      const luma = Math.floor(r * 0.2126 + g * 0.7152 + b * 0.0722);
      const t = luma > thres ? 255 : 0;
      dest.data[i] = dest.data[i + 1] = dest.data[i + 2] = t;
      dest.data[i + 3] = 255;
    }
  }
}

export default ImageUtils;
