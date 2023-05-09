import * as React from "react";
import maplibregl from "maplibre-gl";

// Import the mapbox-gl styles so that the map is displayed correctly
import "maplibre-gl/dist/maplibre-gl.css";
// Import map styles
import nine3030 from "../mapStyles/nine3030";
// Import component styles, i.e. for the markers
import styles from "./MapComponent.module.css";

const getMarkerTypes = () => {
  const stallingTypes = [
    "buurtstalling",
    "fietskluizen",
    "bewaakt",
    "fietstrommel",
    "toezicht",
    "onbewaakt",
    "geautomatiseerd",
  ];

  const stallingMarkers: any = [];
  stallingTypes.forEach((x) => {
    const icon = document.createElement("div");
    icon.classList.add(styles.marker);
    icon.classList.add(styles[`marker-${x}`]);

    stallingMarkers[x] = icon;
  });

  return stallingMarkers;
};

const didClickMarker = (e: any) => {
  console.log("Clicked marker", e);
};

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
      style: nine3030,
      center: [5, 52],
      zoom: 7,
    });

    // save the map object to React.useState
    setMap(mapboxMap);

    // Get all marker types
    const markerTypes = getMarkerTypes();

    let allMarkersOnTheMap: any = [];

    fietsenstallingen.forEach((stalling: any) => {
      if (stalling.Coordinaten !== null && stalling.Type !== null) {
        let coords = stalling.Coordinaten.split(",");

        const marker = new maplibregl.Marker(markerTypes[stalling.Type], {
          // For size relative to zoom level, see: https://stackoverflow.com/a/63876653
        })
          .setLngLat([coords[1], coords[0]])
          .addTo(mapboxMap);

        // Add click handler to marker
        marker.getElement().addEventListener("click", didClickMarker);

        allMarkersOnTheMap.push(marker);
      }
    });

    // Function that executes if component unloads:
    return () => {
      mapboxMap.remove();
      // Remove all marker click events
      allMarkersOnTheMap.forEach((x: any) => {
        x.getElement().removeEventListener("click", didClickMarker);
      });
    };
  }, [fietsenstallingen]);

  return <div ref={mapNode} style={{ width: "100vw", height: "100vh" }} />;
}

export default MapboxMap;
