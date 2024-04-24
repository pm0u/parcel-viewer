import { useMapboxMapContext } from "./context";

import { concurrentFetchGeoJson } from "../../lib/data";
import { useEffect, useState } from "react";
import { bbox, bboxPolygon, transformScale } from "@turf/turf";

export const MapboxMap = () => {
  const { mapContainerRef, map } = useMapboxMapContext();
  const [geoJson, setgeoJson] = useState<GeoJSON.FeatureCollection | null>(
    null
  );
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    const fetchIt = async () => {
      const data = await concurrentFetchGeoJson();
      console.log({ data });
      setgeoJson(data);
    };
    if (!geoJson) {
      fetchIt();
    }
  }, [geoJson]);

  useEffect(() => {
    if (map && geoJson && !initialized) {
      setInitialized(true);
      map.on("load", () => {
        map.addSource("tax_parcels", {
          type: "geojson",
          data: geoJson,
        });
        map.addLayer({
          id: "tax_parcels",
          type: "fill",
          source: "tax_parcels",
          paint: {
            "fill-color": "#0080ff",
            "fill-opacity": 0.5,
            "fill-outline-color": "#2292ff",
          },
        });
        const featureBounds = bbox(geoJson) as [number, number, number, number];
        const viewBounds = bbox(
          transformScale(bboxPolygon(featureBounds), 1.1)
        ) as [number, number, number, number];
        map.fitBounds(viewBounds);
      });
    }
  }, [map, geoJson, initialized]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
};
