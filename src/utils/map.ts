async function getParkingMarker(color: string) {
  const marker = await styleParkingMarker(color);
  return marker;
}

async function styleParkingMarker(color: string) {
  var xmlns = "http://www.w3.org/2000/svg";
  var svgElement = document.createElementNS(xmlns, "svg");
  
  // outer transparant circle
  var circle_1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  circle_1.setAttribute("cx","12");
  circle_1.setAttribute("cy","12");
  circle_1.setAttribute("r","12");
  circle_1.setAttribute("fill","12");
  circle_1.setAttribute("opacity","0.304");
  circle_1.setAttribute("fill", color);
  svgElement.appendChild(circle_1);

  // inner non transparant circle
  var inner_circle = document.createElementNS("http://www.w3.org/2000/svg", 'g');
  inner_circle.setAttribute("transform","translate(2 2)");
  inner_circle.setAttribute("fill",color);
  inner_circle.setAttribute("stroke","#fff");
  inner_circle.setAttribute("stroke-width","1");

  var child_circle_1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  child_circle_1.setAttribute("cx","10");
  child_circle_1.setAttribute("cy","10");
  child_circle_1.setAttribute("r","10");
  child_circle_1.setAttribute("stroke","none");

  var  child_circle_2 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  child_circle_2.setAttribute("cx","10");
  child_circle_2.setAttribute("cy","10");
  child_circle_2.setAttribute("r","9.5");
  child_circle_2.setAttribute("fill","none");
  inner_circle.appendChild(child_circle_1);
  inner_circle.appendChild(child_circle_2);
  svgElement.appendChild(inner_circle);

  var width = {};
  var height = {};

  // console.log(svg.firstChild.tagName);
  svgElement.setAttribute("viewBox", "0 0 24 24");

  width.value = 50;
  height.value = 50;
  
  var canvas = document.createElement('canvas');
  svgElement.setAttribute('width', width.value);
  svgElement.setAttribute('height', height.value);
  canvas.width = width.value;
  canvas.height = height.value;
  var data = new XMLSerializer().serializeToString(svgElement);
  var win = window.URL || window.webkitURL || window;
  var img = new Image();
  var blob = new Blob([data], { type: 'image/svg+xml' });

  var url = win.createObjectURL(blob);
  img.src = url;
  await img.decode();
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  win.revokeObjectURL(url);

  return new Uint8Array(context.getImageData(0, 0, img.width, img.height).data.buffer);
}

export {
  getParkingMarker
}
