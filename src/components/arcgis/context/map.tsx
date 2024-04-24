//import { Map } from "mapbox-gl";
import {
  RefObject,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Legend from "@arcgis/core/widgets/Legend";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_TOKEN;

type MapContext = {
  map: Map | undefined;
  mapView: MapView | undefined;
  mapContainer: RefObject<HTMLDivElement>;
};

//esriConfig.apiKey = import.meta.env.VITE_ARCGIS_TOKEN;

// @ts-expect-error initialized below
const MapboxContext = createContext<MapContext>();

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [map, setMap] = useState<Map>();
  const [mapView, setMapView] = useState<MapView>();
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainer.current) {
      const _map = new Map({
        basemap: "arcgis-topographic",
      });
      const _mapView = new MapView({
        map: _map,
        container: mapContainer.current,
        center: [-106.2925, 39.2508],
        zoom: 12,
      });

      const parcelData = new FeatureLayer({
        url: "https://services1.arcgis.com/38PTfoP8IjlBsxZN/arcgis/rest/services/LCMDParcelInfo/FeatureServer/0",
      });

      const legend = new Legend({
        view: _mapView,
        layerInfos: [
          {
            layer: parcelData,
            title: "Leadville taxpayer",
          },
        ],
      });

      _map.add(parcelData);
      _mapView.ui.components = ["compass", "zoom"];
      _mapView.ui.add(legend, "top-left");

      setMap(_map);
      setMapView(_mapView);
    } else {
      throw Error("mapContainer is not assigned a DOM element!");
    }
  }, []);

  return (
    <MapboxContext.Provider value={{ map, mapContainer, mapView }}>
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapContext = () => {
  const ctx = useContext(MapboxContext);
  if (!ctx) throw Error("useMapContext must be in child of MapProvider!");
  return ctx;
};
