import * as React from "react";
import maplibregl from "maplibre-gl";

// Import the mapbox-gl styles so that the map is displayed correctly
import "maplibre-gl/dist/maplibre-gl.css";
// Import map styles
import nine3030 from "../mapStyles/nine3030";
// Import component styles, i.e. for the markers
import styles from "./MapComponent.module.css";

const getMarkerTypes = () => {
  const stallingTypes: string[] = [
    "buurtstalling",
    "fietskluizen",
    "bewaakt",
    "fietstrommel",
    "toezicht",
    "onbewaakt",
    "geautomatiseerd",
  ];

  const stallingMarkers: { [key: string]: HTMLDivElement } = {};
  stallingTypes.forEach((x) => {
    const icon = document.createElement("div");
    if (styles.marker !== undefined) {
      icon.classList.add(styles.marker);
    }
    if (`marker-${x}` in styles && styles[`marker-${x}`] !== undefined) {
      icon.classList.add(styles[`marker-${x}`] || "");
    }

    stallingMarkers[x] = icon;
  });

  return stallingMarkers;
};

const didClickMarker = (e: any) => {
  console.log("Clicked marker", e);
};

// TODO: maak geojson: https://docs.mapbox.com/help/tutorials/markers-js/
interface GeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    "marker-color": string;
    "marker-size": string;
    "marker-symbol": string;
    title: string;
  };
}

const createGeoJson = (input: GeoJsonFeature[]) => {
  const features: GeoJsonFeature[] = [];

  input.forEach((x: any) => {
    const coords = x.Coordinaten; // I.e.: 52.508011,5.473280;

    // console.log('x', x);
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [coords],
      },
      properties: {
        "marker-color": "#3bb2d0",
        "marker-size": "large",
        "marker-symbol": "rocket",
        title: x.Title,
      },
    });
  });

  return {
    type: "FeatureCollection",
    features: features
  }
};

function MapboxMap({ fietsenstallingen = [] }: any) {
  // this is where the map instance will be stored after initialization
  // const [map, setMap] = React.useState<maplibregl.Map>();

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

    // mapboxMap.on('load', function () {
    //   const geojson = createGeoJson(fietsenstallingen);
    //   mapboxMap.addSource('fietsenstallingen', { type: 'geojson', data: geojson });
    //   mapboxMap.addLayer({
    //     'id': 'fietsenstallingen',
    //     'type': 'symbol',
    //     'source': 'fietsenstallingen',

    //     'layout': {
    //       'icon-image': ["concat", ['get', 'system_id'], '-p:', ['get', 'duration_bin']],
    //       // 'icon-size': 0.4,
    //       'icon-size': [
    //         'interpolate',
    //           ['linear'],
    //           ['zoom'],
    //           11,
    //           0.2,
    //           16,
    //           0.7
    //         ],
    //       'icon-allow-overlap': true,
    //     },

    //   });
    // });

    // save the map object to React.useState
    // setMap(mapboxMap);

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
