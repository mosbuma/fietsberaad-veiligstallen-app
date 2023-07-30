// @ts-nocheck
import * as React from "react";
import maplibregl from "maplibre-gl";
import * as turf from '@turf/turf'
import { useDispatch, useSelector } from "react-redux";
import {
  setMapExtent,
  setMapZoom,
  setMapVisibleFeatures
} from "~/store/mapSlice";

import { AppState } from "~/store/store";

// Import utils
import {getParkingColor} from '~/utils/theme'
import {
  getParkingMarker,
  isPointInsidePolygon
} from '~/utils/map/index'
import {
  getActiveMunicipality
} from '~/utils/map/active_municipality'
import {
  mapMoveEndEvents
} from '~/utils/map/parkingsFilteringBasedOnExtent'
import {parkingTypes} from '~/utils/parkings'

// Import the mapbox-gl styles so that the map is displayed correctly
import "maplibre-gl/dist/maplibre-gl.css";
// Import map styles
import nine3030 from "../mapStyles/nine3030";
// Import component styles, i.e. for the markers
import styles from "./MapComponent.module.css";

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
        id: x.ID,
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
  const [stateMap, setStateMap] = React.useState<maplibregl.Map>();

  // Connect to redux store
  const dispatch = useDispatch()

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const mapExtent = useSelector(
    (state: AppState) => state.map.extent
  );

  const mapZoom = useSelector(
    (state: AppState) => state.map.zoom
  );

  const filterActiveTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const municipalities = useSelector(
    (state: AppState) => state.geo.municipalities
  );
  console.log('municipalities', municipalities)

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

    // If stateMap already exists: Stop, as the map is already initiated
    if(stateMap) return;

    // otherwise, create a map instance
    const mapboxMap = new maplibregl.Map({
      container: node,
      accessToken: process ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : "",
      // style: "maplibre://styles/mapbox/streets-v11",
      style: nine3030,
      center: [5, 52],
      zoom: 7,
    });

    mapboxMap.on('load', () => onMapLoaded(mapboxMap));

    // Function that executes if component unloads:
    return () => {
      mapboxMap.remove();
    };
  }, []);

  // If 'fietsenstallingen' variable changes: Update source data
  React.useEffect(() => {
    if(! stateMap || stateMap === undefined) return;
    if(! stateMap.getSource) return;

    // Create geojson
    const geojson: any = createGeoJson(fietsenstallingen);

    // Add or update fietsenstallingen data
    const source: maplibregl.GeoJSONSource = stateMap.getSource('fietsenstallingen') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
    } else {
      stateMap.addSource('fietsenstallingen', { type: 'geojson', data: geojson });
    }

    // Add markers layer
    if(! stateMap.getLayer('fietsenstallingen-markers')) {
      stateMap.addLayer({
        'id': 'fietsenstallingen-markers',
        'source': 'fietsenstallingen',
        'type': 'circle',
        'filter': ['all'],
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
    }
  }, [
    stateMap,
    fietsenstallingen
  ]);

  // Filter map markers if activeTypes filter changes
  React.useEffect(() => {
    if(! stateMap) return;

    const geojson = createGeoJson(fietsenstallingen);

    stateMap.setFilter(
      'fietsenstallingen-markers',
      ['all', ['in', ['get', 'type'], ['literal', activeTypes]]]
    )
  }, [
    stateMap,
    fietsenstallingen,
    activeTypes
  ])

  // Update visible features in state if filter changes
  React.useEffect(() => {
    if(! stateMap) return;

    mapMoveEndEvents(stateMap, (visibleFeatures) => {
      dispatch(setMapVisibleFeatures(visibleFeatures));
    });
  }, [
    stateMap,
    filterActiveTypes
  ]);

  // Function that's called if map is loaded
  const onMapLoaded = (mapboxMap) => {
    // Save map as local variabele
    setStateMap(mapboxMap);
    // Set event handlers
    // mapboxMap.on('movestart', function() {})
    mapboxMap.on('moveend', () => {
      onMoved(mapboxMap)
    });
    mapboxMap.on('zoomend', function() {
      registerMapView(mapboxMap);
    });
    // Call onMoveEnd if map is loaded, as initialization
    // This function is called when all rendering has been done
    mapboxMap.on('idle',function() {
      onMoved(mapboxMap);
    });
  }

  const onMoved = (mapboxMap) => {
    // Register map view in state (extend and zoom level)
    registerMapView(mapboxMap);
    // Set visible features into state
    mapMoveEndEvents(mapboxMap, (visibleFeatures) => {
      dispatch(setMapVisibleFeatures(visibleFeatures));
    });
  }

  const registerMapView = React.useCallback(theMap => {
    // Set map boundaries
    const bounds = theMap.getBounds();
    const extent = [
      bounds._sw.lng,
      bounds._sw.lat,
      bounds._ne.lng,
      bounds._ne.lat
    ];
    // Create polygon that represents the boundaries of the map
    const polygon = turf.points([
      [extent[1], extent[0]],
      [extent[3], extent[2]]
    ]);
    // Calculate the center of this map view
    const center = turf.center(polygon)
    const activeMunicipality = getActiveMunicipality(center);
    // console.log('municipalities', municipalities)
    // console.log('activeMunicipality', activeMunicipality);
    // Set values in state
    dispatch(setMapExtent(extent));
    dispatch(setMapZoom(theMap.getZoom()));
  }, []);

  return <div ref={mapNode} style={{ width: "100vw", height: "100vh" }} />;
}

export default MapboxMap;
