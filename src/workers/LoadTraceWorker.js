/* eslint-disable */

var pako = require('pako');
var UTF8 = require('utf-8');
var TextEncoding = require('text-encoding');

onmessage = function(e) {
  console.log(`load trace worker: ${e}`);

  console.log('received trace response');
  var arrayBuffer = e.data[0]; // Note: not oReq.responseText
  if (arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    console.log(byteArray.byteLength);
    var deflated = pako.inflateRaw(byteArray);
    console.log(`deflated size: ${deflated.length}`);

    // var string = new TextEncoding.TextDecoder('utf-8').decode(deflated);
    var string = UTF8.getStringFromBytes(deflated);
    console.log(string.length);
    console.log(string.slice(0, 100));

    // var parsed = JSON.parse(string);
    // console.log(parsed);

    self.postMessage([string]);
  }
}

/* eslint-enable */
