async function getParkingMarker(color: string) {
  const marker = await styleParkingMarker(color);
  return marker;
}

async function styleParkingMarker(color: string) {
  const xmlns = "http://www.w3.org/2000/svg";
  const svgElement = document.createElementNS(xmlns, "svg");
  
  // outer transparant circle
  const circle_1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  circle_1.setAttribute("cx","12");
  circle_1.setAttribute("cy","12");
  circle_1.setAttribute("r","12");
  circle_1.setAttribute("fill","12");
  circle_1.setAttribute("opacity","0.304");
  circle_1.setAttribute("fill", color);
  svgElement.appendChild(circle_1);

  // inner non transparant circle
  const inner_circle = document.createElementNS("http://www.w3.org/2000/svg", 'g');
  inner_circle.setAttribute("transform","translate(2 2)");
  inner_circle.setAttribute("fill",color);
  inner_circle.setAttribute("stroke","#fff");
  inner_circle.setAttribute("stroke-width","1");

  const child_circle_1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  child_circle_1.setAttribute("cx","10");
  child_circle_1.setAttribute("cy","10");
  child_circle_1.setAttribute("r","10");
  child_circle_1.setAttribute("stroke","none");

  const child_circle_2 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  child_circle_2.setAttribute("cx","10");
  child_circle_2.setAttribute("cy","10");
  child_circle_2.setAttribute("r","9.5");
  child_circle_2.setAttribute("fill","none");
  inner_circle.appendChild(child_circle_1);
  inner_circle.appendChild(child_circle_2);
  svgElement.appendChild(inner_circle);

  const width: any = {};
  const height: any = {};

  // console.log(svg.firstChild.tagName);
  svgElement.setAttribute("viewBox", "0 0 24 24");

  width.value = 50;
  height.value = 50;
  
  const canvas = document.createElement('canvas');
  svgElement.setAttribute('width', width.value);
  svgElement.setAttribute('height', height.value);
  canvas.width = width.value;
  canvas.height = height.value;
  const data = new XMLSerializer().serializeToString(svgElement);
  const win = window.URL || window.webkitURL || window;
  const img = new Image();
  const blob = new Blob([data], { type: 'image/svg+xml' });

  const url = win.createObjectURL(blob);
  img.src = url;
  await img.decode();
  const context = canvas.getContext('2d');
  if(! context) {
    return;
  }
  
  context.drawImage(img, 0, 0);
  win.revokeObjectURL(url);

  return new Uint8Array(context.getImageData(0, 0, img.width, img.height).data.buffer);
}

// Check if lat/lng point is inside polygon
// https://stackoverflow.com/a/29915728
//
// Example usage:
// var polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];
// isPointInsidePolygon([ 1.5, 1.5 ], polygon); // true
const isPointInsidePolygon = (point, vs) => {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html

  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0], yi = vs[i][1];
      var xj = vs[j][0], yj = vs[j][1];
      
      var intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
  }

  return inside;
};

const convertCoordinatenToCoords = (Coordinaten) => {
  if(! Coordinaten) return;

  const coords = Coordinaten.split(",").map((coord: any) => Number(coord)); // I.e.: 52.508011,5.473280;

  return [coords[1], coords[0]];
}

const openRoute = (Coordinaten) => {
  if(! Coordinaten) return;
  // Get coords from parking variable
  const coords = convertCoordinatenToCoords(Coordinaten);
  const coordsString = "" + coords[1] + ',' + coords[0]; // E.g. 51.9165409,4.4480073
  // Generate route URL
  // dirflg: b=bicycling. Source: https://webapps.stackexchange.com/a/67255
  const url = `https://www.google.com/maps/dir/?api=1&travelmode=bicycling&destination=${coordsString}&z=17&dirflg=b`;
  // window.open(url, '_blank');
  // If it's an iPhone..
  if( (navigator.platform.indexOf("iPhone") != -1) 
    || (navigator.platform.indexOf("iPod") != -1)
    || (navigator.platform.indexOf("iPad") != -1)
  ) {
    window.open(url.replace('https://', 'maps://'));
  }
  else {
    window.open(url);
  }
}

export {
  getParkingMarker,
  isPointInsidePolygon,
  convertCoordinatenToCoords,
  openRoute
}
