import React, { useEffect, useState, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";
import { useDispatch, useSelector } from "react-redux";
import {
  setMapExtent,
  setMapZoom,
  setMapVisibleFeatures,
  setActiveMunicipality,
  setSelectedParkingId,
} from "~/store/mapSlice";
import { type vsFietsenstallingen } from "~/utils/prisma";

import { AppState } from "~/store/store";

// Import utils
import {
  convertCoordinatenToCoords,
} from "~/utils/map/index";
import { getMunicipalityBasedOnLatLng } from "~/utils/map/active_municipality";
import { mapMoveEndEvents } from "~/utils/map/parkingsFilteringBasedOnExtent";

// Import the mapbox-gl styles so that the map is displayed correctly
import "maplibre-gl/dist/maplibre-gl.css";
// Import map styles
import nine3030 from "../mapStyles/nine3030";
// Import component styles, i.e. for the markers
import styles from "./MapComponent.module.css";

// Add custom markers
// const addMarkerImages = (map: any) => {
//   const addMarkerImage = async (parkingType: string) => {
//     if (map.hasImage(parkingType)) {
//       console.log("parkingType image for %s already exists", parkingType);
//       return;
//     }
//     const marker = await getParkingMarker(getParkingColor(parkingType));
//     // Add marker image
//     map.addImage(parkingType, { width: 50, height: 50, data: marker });
//   };
//   parkingTypes.forEach((x) => {
//     addMarkerImage(x);
//   });
// };

interface GeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    id: string;
    title: string;
    location: string;
    plaats: string;
    type: string;
  };
}

const createGeoJson = (input: vsFietsenstallingen[]) => {
  let features: GeoJsonFeature[] = [];

  input.forEach((x: vsFietsenstallingen) => {
    if (!x.Coordinaten) return;

    const coords = convertCoordinatenToCoords(x.Coordinaten);
    if (!coords) return;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: coords,
      },
      properties: {
        id: x.ID,
        title: (x.Title || "").toLowerCase(),
        location: (x.Location || "").toLowerCase(),
        plaats: (x.Plaats || "").toLowerCase(),
        type: x.Type || "unknown",
      },
    });
  });

  return {
    type: "FeatureCollection",
    features: features,
  };
};

function MapboxMap({ fietsenstallingen = [] }: { fietsenstallingen: vsFietsenstallingen[] }) {
  // this is where the map instance will be stored after initialization
  const [stateMap, setStateMap] = useState<maplibregl.Map>();

  // Connect to redux store
  const dispatch = useDispatch();

  const filterActiveTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const filterQuery = useSelector((state: AppState) => state.filter.query);

  // const mapExtent = useSelector((state: AppState) => state.map.extent);

  // const mapZoom = useSelector((state: AppState) => state.map.zoom);

  const initialLatLng = useSelector(
    (state: AppState) => state.map.initialLatLng
  );

  // const municipalities = useSelector(
  //   (state: AppState) => state.geo.municipalities
  // );

  const selectedParkingId = useSelector(
    (state: AppState) => state.map.selectedParkingId
  );

  const isParkingListVisible = useSelector(
    (state: AppState) => state.app.isParkingListVisible
  );

  // React ref to store a reference to the DOM node that will be used
  // as a required parameter `container` when initializing the mapbox-gl
  // will contain `null` by default
  const mapNode = useRef(null);

  // Highlight marker if selectedParkingId changes
  useEffect(() => {
    if (!stateMap) return;
    if (!selectedParkingId) return;
    // Highlight marker
    highlighMarker(stateMap, selectedParkingId);
    // Stop if parking list is full screen
    // If we would continue the parking list would be filtered on click
    // That would result in e.g. only 1 parking in the parking list
    if (isParkingListVisible) return;
    // Center map to selected parking
    const selectedParking = fietsenstallingen.find(
      (x: vsFietsenstallingen) => x.ID === selectedParkingId
    );
    if (selectedParking && selectedParking.Coordinaten) {
      const coords = convertCoordinatenToCoords(selectedParking.Coordinaten);
      // if (!coords) return;

      stateMap.flyTo({
        center: coords && [Number(coords[0]), Number(coords[1])],
        // curve: 1,
        speed: 0.75,
        zoom: 14,
        // easing(t) {
        //   return t;
        // }
      });
    }
  }, [stateMap, selectedParkingId,]);

  useEffect(() => {
    const node = mapNode.current;

    // if the window object is not found, that means
    // the component is rendered on the server
    // or the dom node is not initialized, then return early
    if (typeof window === "undefined" || node === null) return;

    // If stateMap already exists: Stop, as the map is already initiated
    if (stateMap) return;

    // otherwise, create a map instance
    const style: maplibregl.StyleSpecification = nine3030 as maplibregl.StyleSpecification;
    const mapboxMap = new maplibregl.Map({
      container: node,
      // accessToken: process ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : "",
      // style: "maplibre://styles/mapbox/streets-v11",
      style,
      center: [5, 52],
      zoom: 7,
    });

    mapboxMap.on("load", () => onMapLoaded(mapboxMap));
    mapboxMap.on("styleimagemissing", (e) => {
      // add transparent image to prevent errors
      const id = e.id; // id of the missing image

      // extract the color from the id
      const width = 1;
      const bytesPerPixel = 4;
      const data = new Uint8Array(width * width * bytesPerPixel);
      mapboxMap.addImage(id, { width, height: width, data });

      // console.log("added missing map marker image ", id)
    });

    // Function that executes if component unloads:
    return () => {
      mapboxMap.remove();
    };
  }, []);

  // Fly to municipality if initial municipality is given
  useEffect(() => {
    if (!stateMap) return;
    if (!initialLatLng) return;

    stateMap.flyTo({
      center: initialLatLng,
      // speed: 0.75,
      duration: 1500,
      essential: true,
      zoom: 13,
    });
  }, [stateMap, initialLatLng]);

  // If 'fietsenstallingen' variable changes: Update source data
  useEffect(() => {
    try {
      if (
        !stateMap ||
        stateMap === undefined ||
        "getSource" in stateMap === false
      )
        return;
      if (!stateMap.getSource) return;

      // Create geojson
      const geojson: any = createGeoJson(fietsenstallingen);

      // Add or update fietsenstallingen data as sources
      const addOrUpdateSource = (sourceKey: string) => {
        const source: maplibregl.GeoJSONSource = stateMap.getSource(
          sourceKey
        ) as maplibregl.GeoJSONSource;
        if (source) {
          source.setData(geojson);
        } else {
          const sourceConfig: maplibregl.GeoJSONSourceSpecification = {
            type: "geojson",
            data: geojson,
            cluster: false,
            clusterRadius: 40,
            clusterMaxZoom: 12,
          };

          if (sourceKey === "fietsenstallingen-clusters") {
            // We want to cluster
            sourceConfig.cluster = true;
            // Max zoom to cluster points on
            // clusterMaxZoom: 18,
            // Radius of each cluster when clustering points (defaults to 50)
            sourceConfig.clusterRadius = 40;
            sourceConfig.clusterMaxZoom = 12;
          }
          stateMap.addSource(sourceKey, sourceConfig);
        }
      };
      addOrUpdateSource("fietsenstallingen");
      addOrUpdateSource("fietsenstallingen-clusters");

      // Add MARKERS layer
      if (!stateMap.getLayer("fietsenstallingen-markers")) {
        stateMap.addLayer({
          id: "fietsenstallingen-markers",
          source: "fietsenstallingen",
          type: "circle",
          // filter: ["all"],
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#fff",
            "circle-radius": 5,
            "circle-stroke-width": 4,
            "circle-stroke-color": [
              "match",
              ["get", "type"],
              "bewaakt",
              "#00BDD5",
              "geautomatiseerd",
              "#028090",
              "fietskluizen",
              "#9E1616",
              "fietstrommel",
              "#DF4AAD",
              "buurtstalling",
              "#FFB300",
              "publiek",
              "#00CE83",
              "#00CE83",
            ],
          },
          // "icon-allow-overlap": true, -> only exists on symbols
          minzoom: 12,
        });
      }

      // Add CLUSTERS layer
      if (!stateMap.getLayer("fietsenstallingen-clusters")) {
        stateMap.addLayer({
          id: "fietsenstallingen-clusters",
          source: "fietsenstallingen-clusters",
          type: "circle",
          filter: ["has", "point_count"],
          paint: {
            // Use step expressions (https://maplibre.org/maplibre-gl-js-docs/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            "circle-color": "#fff",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#15AEEF",
          },
          maxzoom: 12,
        });
      }

      // Add CLUSTERS COUNT layer
      if (!stateMap.getLayer("fietsenstallingen-clusters-count")) {
        stateMap.addLayer({
          id: "fietsenstallingen-clusters-count",
          source: "fietsenstallingen-clusters",
          type: "symbol",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": ["step", ["get", "point_count"], 16, 100, 20, 750, 30],
          },
          paint: {
            "text-color": "#333333",
            // 'text-halo-color': '#fff',
            // 'text-halo-width': 2
          },
          maxzoom: 12,
        });
      }
    } catch (ex) {
      console.warn("error in MapComponent layer update useEffect call", ex);
    }
  }, [stateMap, fietsenstallingen]);

  // Filter map markers if filterActiveTypes filter changes
  useEffect(() => {
    try {
      if (!stateMap) return;

      let filter: maplibregl.FilterSpecification = [
        "all",
        ["in", ["get", "type"], ["literal", filterActiveTypes]],
      ];
      if (filterQuery === "") {
        filter = [
          "all",
          ["in", ["get", "type"], ["literal", filterActiveTypes]],
        ];
      } else {
        filter = [
          "all",
          ["in", ["get", "type"], ["literal", filterActiveTypes]],
          [
            "any",
            [
              ">",
              [
                "index-of",
                ["literal", filterQuery.toLowerCase()],
                ["get", "title"],
              ],
              -1,
            ],
            [
              ">",
              [
                "index-of",
                ["literal", filterQuery.toLowerCase()],
                ["get", "locatie"],
              ],
              -1,
            ],
            [
              ">",
              [
                "index-of",
                ["literal", filterQuery.toLowerCase()],
                ["get", "plaats"],
              ],
              -1,
            ],
          ],
        ];
      }
      // stateMap.setFilter("fietsenstallingen-markers", filter);
    } catch (ex) {
      console.warn("error in MapComponent layer setfilter useEffect call", ex);
    }
  }, [stateMap, fietsenstallingen, filterActiveTypes, filterQuery]);

  // Update visible features in state if filter changes
  useEffect(() => {
    if (!stateMap) return;

    mapMoveEndEvents(stateMap, (visibleFeatures: string[]) => {
      dispatch(setMapVisibleFeatures(visibleFeatures));
    });
  }, [stateMap, filterActiveTypes]);

  const highlighMarker = (map: any, id: string) => {
    try {
      map.setPaintProperty("fietsenstallingen-markers", "circle-radius", [
        "case",
        ["==", ["get", "id"], id],
        10,
        5,
      ]);
      map.setPaintProperty("fietsenstallingen-markers", "circle-stroke-width", [
        "case",
        ["==", ["get", "id"], id],
        3,
        4,
      ]);
    } catch (ex) {
      console.error("highlighMarke - error", ex);
    }
  };

  // Function that's called if map is loaded
  const onMapLoaded = (mapboxMap: maplibregl.Map) => {
    // Save map as local variabele
    setStateMap(mapboxMap);
    // Set event handlers
    // mapboxMap.on('movestart', function() {})
    mapboxMap.on("moveend", () => {
      onMoved(mapboxMap);
    });
    mapboxMap.on("zoomend", function () {
      registerMapView(mapboxMap);
    });
    // Call onMoveEnd if map is loaded, as initialization
    // This function is called when all rendering has been done
    // mapboxMap.on("idle", function () {
    onMoved(mapboxMap);
    // });
    // Show parking info on click
    mapboxMap.on("click", "fietsenstallingen-markers", (e) => {
      // Make clicked parking active
      if (e.features && e.features.length > 0 && e.features[0] && e.features[0].properties) {
        dispatch(setSelectedParkingId(e.features[0].properties.id));
      }
    });
    // Enlarge parking icon on click
    mapboxMap.on("click", "fietsenstallingen-markers", (e) => {
      if (e.features && e.features.length > 0 && e.features[0] && e.features[0].properties) {
        highlighMarker(mapboxMap, e.features[0].properties.id);
      }
    });
    // Zoom in on cluster click
    mapboxMap.on("click", "fietsenstallingen-clusters", (e) => {
      // Zoom in
      mapboxMap.flyTo({
        center: e.lngLat,
        duration: 1000,
        zoom: mapboxMap.getZoom() + 4,
      });
    });
  };

  const onMoved = (mapboxMap: maplibregl.Map) => {
    // Register map view in state (extend and zoom level)
    registerMapView(mapboxMap);
    // Set visible features into state
    mapMoveEndEvents(mapboxMap, (visibleFeatures: string[]) => {
      dispatch(setMapVisibleFeatures(visibleFeatures));
    });
  };

  const getActiveMunicipality = async (center: Array<Number | undefined>) => {
    const municipality = await getMunicipalityBasedOnLatLng(center);
    if (!municipality) return;

    return municipality;
  };

  const registerMapView = useCallback((theMap: maplibregl.Map) => {
    // Set map boundaries
    const bounds = theMap.getBounds();
    const extent = [
      bounds._sw.lng,
      bounds._sw.lat,
      bounds._ne.lng,
      bounds._ne.lat,
    ];

    if (!extent[0] || !extent[1] || !extent[2] || !extent[3]) return;

    // Create polygon that represents the boundaries of the map
    const polygon = turf.points([
      [extent[1], extent[0]],
      [extent[3], extent[2]],
    ]);
    // Calculate the center of this map view
    const center = turf.center(polygon);
    // Get active municipality
    (async () => {
      if (!center) return;
      const activeMunicipality = await getActiveMunicipality(
        center.geometry.coordinates
      );
      dispatch(setActiveMunicipality(activeMunicipality));
    })();

    // Set values in state
    dispatch(setMapExtent(extent));
    dispatch(setMapZoom(theMap.getZoom()));
  }, []);

  const isSm = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div
      ref={mapNode}
      style={{ width: "100vw", height: "100dvh", overflowY: "hidden" }}
    />
  );
}

export default MapboxMap;
