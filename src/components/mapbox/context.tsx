import { Map } from "mapbox-gl";
import { useContext, createContext, useState, useEffect } from "react";

type MapboxMapCtx = {
  map?: Map | undefined;
  mapContainer: HTMLDivElement | null;
  mapContainerRef: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
};

const MapboxMapContext = createContext<MapboxMapCtx>({});

export const MapboxMapProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [map, setMap] = useState<Map>();
  const [mapContainer, mapContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapContainer) {
      if (map) {
        map.remove();
      }
      const _map = new Map({
        accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
        container: mapContainer,
      });
      setMap(_map);
    }
  }, [mapContainer]);

  return (
    <MapboxMapContext.Provider value={{ map, mapContainer, mapContainerRef }}>
      {children}
    </MapboxMapContext.Provider>
  );
};

export const useMapboxMapContext = () => {
  const ctx = useContext(MapboxMapContext);
  if (!ctx)
    throw new Error(
      "useMapboxMapContext must be used in child of MapboxMapProvider!!"
    );
  return ctx;
};
