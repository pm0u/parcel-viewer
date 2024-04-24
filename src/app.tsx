import { MapboxMapProvider } from "./components/mapbox/context";
import { MapboxMap } from "./components/mapbox/map";

function App() {
  return (
    <MapboxMapProvider>
      <MapboxMap />
    </MapboxMapProvider>
  );
}

export default App;
