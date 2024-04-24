import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

type ArcGISResponse = GeoJSON.FeatureCollection & {
  properties?: {
    exceededTransferLimit?: true;
  };
};

const PAGE_SIZE = 2000;

export const concurrentFetchGeoJson = async (
  merge: ArcGISResponse[] = [],
  concurrent = 6
): Promise<GeoJSON.FeatureCollection> => {
  const results = await Promise.all(constructFetches(concurrent));
  const cleanResults = results.filter(
    (res) => res !== undefined
  ) as unknown as ArcGISResponse[];
  if (
    cleanResults[cleanResults.length - 1]?.properties?.exceededTransferLimit
  ) {
    return concurrentFetchGeoJson(cleanResults);
  }
  return combineResults([...merge, ...cleanResults]);
};

const combineResults = (results: ArcGISResponse[]) =>
  results.slice(1).reduce((combined, result) => {
    delete combined.properties;
    return {
      ...combined,
      features: [...combined.features, ...result.features],
    };
  }, results[0]);

const constructFetches = (num: number) => {
  if (num < 1) throw Error("Cannot construct less than 1 fetch");
  return Array.from(Array(num)).map((_, i) => fetchGeoJson(PAGE_SIZE * i));
};

export const fetchGeoJson = async (
  offset = 0
): Promise<ArcGISResponse | undefined> => {
  const url = new URL(
    "https://services1.arcgis.com/38PTfoP8IjlBsxZN/arcgis/rest/services/LCMDParcelInfo/FeatureServer/0/query"
  );
  url.searchParams.append("where", "1=1");
  url.searchParams.append("returnExceededLimitFeatures", "true");
  url.searchParams.append("f", "pgeojson");
  url.searchParams.append("outFields", "*");
  if (offset) {
    url.searchParams.append("resultOffset", offset.toString());
  }
  return fetch(url).then((res) => {
    if (res.ok) {
      return res.json() as Promise<ArcGISResponse>;
    }
  });
};

export const featureJson = () => {
  const parcelData = new FeatureLayer({
    url: "https://services1.arcgis.com/38PTfoP8IjlBsxZN/arcgis/rest/services/LCMDParcelInfo/FeatureServer/0",
  });
  return parcelData
    .queryFeatures({ where: "1=1", outFields: ["*"] })
    .then((featureSet) => featureSet.toJSON());
};
