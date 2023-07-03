import * as React from "react";
import maplibregl from "maplibre-gl";

// Import utils
import {getParkingColor} from '~/utils/theme'
import {getParkingMarker} from '~/utils/map'
import {parkingTypes} from '~/utils/parkings'

// Import the mapbox-gl styles so that the map is displayed correctly
import "maplibre-gl/dist/maplibre-gl.css";
// Import map styles
import nine3030 from "../mapStyles/nine3030";
// Import component styles, i.e. for the markers
import styles from "./MapComponent.module.css";

const getMarkerTypes = () => {
  const stallingTypes: string[] = parkingTypes;

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

// Add custom markers
const addMarkerImages = (map: any) => {
  const addMarkerImage = async(parkingType: string) => {
    if (map.hasImage(parkingType)) {
      console.log("parkingType image for %s already exists", parkingType);
      return;
    }
    const marker = await getParkingMarker(getParkingColor(parkingType));
    // Add marker image
    map.addImage(parkingType, { width: 50, height: 50, data: marker});
  };
  parkingTypes.forEach(x => {
    addMarkerImage(x);
  });
}

interface GeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    title: string;
    type: string;
  };
}

const createGeoJson = (input: GeoJsonFeature[]) => {
  let features: GeoJsonFeature[] = [];

  input.forEach((x: any) => {
    if(! x.Coordinaten) return;

    const coords = x.Coordinaten.split(",").map((coord: any) => Number(coord)); // I.e.: 52.508011,5.473280;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [coords[1], coords[0]],
      },
      properties: {
        title: x.Title,
        type: x.Type || 'unknown'
      },
    });
  });

  return {
    type: 'FeatureCollection',
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

    mapboxMap.on('load', function () {
      window['VS_mapboxMap'] = mapboxMap;
      addMarkerImages(mapboxMap);

      const geojson = createGeoJson(fietsenstallingen);

      mapboxMap.addSource('fietsenstallingen', { type: 'geojson', data: geojson });
      console.log('geojson', geojson)

      // setFilter
      // https://docs.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/

      mapboxMap.addLayer({
        'id': 'fietsenstallingen-markers',
        'source': 'fietsenstallingen',
        'type': 'circle',
        'paint': {
          'circle-color': '#fff',
          'circle-radius': 5,
          'circle-stroke-width': 4,
          'circle-stroke-color': [
            'match', ['get','type'],
            'bewaakt', '#028090',
            'geautomatiseerd', '#028090',
            'fietskluizen', '#9E1616',
            'fietstrommel', '#DF4AAD',
            'buurtstalling', '#FFB300',
            'publiek', '#00CE83',
            '#00CE83'
          ]
        }
      });
    });

    // save the map object to React.useState
    // setMap(mapboxMap);

    // Get all marker types
    // const markerTypes = getMarkerTypes();

    // let allMarkersOnTheMap: any = [];

    // fietsenstallingen.forEach((stalling: any) => {
    //   if (stalling.Coordinaten !== null && stalling.Type !== null) {
    //     let coords = stalling.Coordinaten.split(",");

    //     const marker = new maplibregl.Marker(markerTypes[stalling.Type], {
    //       // For size relative to zoom level, see: https://stackoverflow.com/a/63876653
    //     })
    //       .setLngLat([coords[1], coords[0]])
    //       .addTo(mapboxMap);

    //     // Add click handler to marker
    //     marker.getElement().addEventListener("click", didClickMarker);

    //     allMarkersOnTheMap.push(marker);
    //   }
    // });

    // Function that executes if component unloads:
    return () => {
      mapboxMap.remove();
      // Remove all marker click events
      // allMarkersOnTheMap.forEach((x: any) => {
      //   x.getElement().removeEventListener("click", didClickMarker);
      // });
    };
  }, [fietsenstallingen]);

  return <div ref={mapNode} style={{ width: "100vw", height: "100vh" }} />;
}

export default MapboxMap;
