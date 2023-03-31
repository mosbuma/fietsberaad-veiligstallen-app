import * as React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import baseStyle from "./MapStyles/base.js";

// import the mapbox-gl styles so that the map is displayed correctly

function MapboxMap({ fietsenstallingen = [] }: any) {
  // this is where the map instance will be stored after initialization
  const [map, setMap] = React.useState<maplibregl.Map>();

  // React ref to store a reference to the DOM node that will be used
  // as a required parameter `container` when initializing the mapbox-gl
  // will contain `null` by default
  const mapNode = React.useRef(null);

  React.useEffect(() => {
    const node = mapNode.current;
    // if the window object is not found, that means
    // the component is rendered on the server
    // or the dom node is not initialized, then return early
    if (typeof window === "undefined" || node === null) return;

    // otherwise, create a map instance
    const mapboxMap = new maplibregl.Map({
      container: node,
      accessToken: process ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : "",
      // style: "maplibre://styles/mapbox/streets-v11",
      style:
        "https://api.maptiler.com/maps/hybrid/style.json?key=ZH8yI08EPvuzF57Lyc61",
      center: [5, 52],
      zoom: 7,
    });

    // save the map object to React.useState
    setMap(mapboxMap);

    fietsenstallingen.forEach((stalling: any) => {
      if (stalling.Coordinaten !== null && stalling.Type !== null) {
        let coords = stalling.Coordinaten.split(",");
        let color = "#FFFFFF";
        switch (stalling.Type) {
          case "buurtstalling":
            color = "yellow";
            break;
          case "fietskluizen":
            color = "orange";
            break;
          case "bewaakt":
            color = "green";
            break;
          case "fietstrommel":
            color = "yellow";
            break;
          case "toezicht":
            color = "red";
            break;
          case "onbewaakt":
            color = "green";
            break;
          case "geautomatiseerd":
            color = "green";
            break;
        }
        const marker = new maplibregl.Marker({
          color,
          scale: "0.5",
        })
          .setLngLat([coords[1], coords[0]])
          .addTo(mapboxMap);
      }
    });

    return () => {
      mapboxMap.remove();
    };
  }, []);

  return <div ref={mapNode} style={{ width: "100vw", height: "100vh" }} />;
}

export default MapboxMap;
