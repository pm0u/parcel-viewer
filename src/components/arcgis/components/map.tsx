import { useMapContext } from "../context/map";

export const Map = () => {
  const { mapContainer } = useMapContext();

  return <div ref={mapContainer} className="h-full w-full" />;
};
