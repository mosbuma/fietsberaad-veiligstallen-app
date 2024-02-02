import { MapGeoJSONFeature } from 'maplibre-gl';

// Filter parking based on map extent
// Inspired by https://docs.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/
const layerName = 'fietsenstallingen-markers';

// Because features come from tiled vector data,
// feature geometries may be split
// or duplicated across tile boundaries.
// As a result, features may appear
// multiple times in query results.
function getUniqueFeatures(features: MapGeoJSONFeature[], comparatorProperty: string): MapGeoJSONFeature[] {
  const uniqueIds = new Set();
  const uniqueFeatures: any[] = [];
  for (const feature of features) {
    const id = feature.properties[comparatorProperty];
    if (!uniqueIds.has(id)) {
      uniqueIds.add(id);
      uniqueFeatures.push(feature.properties);
    }
  }
  return uniqueFeatures;
}

export const mapMoveEndEvents = (map: maplibregl.Map, setVisibleFeatures: (features: MapGeoJSONFeature[]) => void): void => {
  try {
    // Check if layer exists
    if (!map.getLayer(layerName)) {
      // console.log('mapMoveEndEvents :: No layer exists yet');
      return;
    }
    const features = map.queryRenderedFeatures(undefined, { layers: [layerName] }) as MapGeoJSONFeature[];

    if (features) {
      const uniqueFeatures = getUniqueFeatures(features, 'id');
      setVisibleFeatures(uniqueFeatures);
    }
  } catch (ex) {
    console.warn("mapMoveEndEvents :: exception", ex);
  }
}