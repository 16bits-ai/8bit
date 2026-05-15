import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useMemo, useState } from 'react';
import Map, { Marker, NavigationControl, Popup, ViewStateChangeEvent } from 'react-map-gl/mapbox';

export interface TravelMarker {
  id: string | number;
  longitude: number;
  latitude: number;
  size?: number;
  color?: string;
  name?: string;
  description?: string;
  images?: string[];
}

interface TravelGlobeMapProps {
  width?: string | number;
  height?: string | number;
  mapboxToken?: string;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
  };
  markers?: TravelMarker[];
  interactiveMarkers?: boolean;
  showPhotoCards?: boolean;
  onMarkerClick?: (marker: TravelMarker) => void;
}

const getMarkerColor = (marker: TravelMarker) => marker.color ?? '#FFE66D';

const pickImages = (images: string[] = [], count = 5) => images.slice(0, count);

const darkPixelMapStyle = {
  version: 8,
  sources: {
    composite: {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  sprite: 'mapbox://sprites/mapbox/dark-v11',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#020202' } },
    {
      id: 'water',
      type: 'fill',
      source: 'composite',
      'source-layer': 'water',
      paint: { 'fill-color': '#050b10', 'fill-opacity': 1 },
    },
    {
      id: 'landuse',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      paint: { 'fill-color': '#070707', 'fill-opacity': 0.55 },
    },
    {
      id: 'admin-boundaries',
      type: 'line',
      source: 'composite',
      'source-layer': 'admin',
      paint: { 'line-color': '#FFE66D', 'line-opacity': 0.26, 'line-width': 0.8 },
    },
    {
      id: 'roads',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      minzoom: 2,
      paint: { 'line-color': '#FFE66D', 'line-opacity': 0.14, 'line-width': 0.7 },
    },
    {
      id: 'place-labels',
      type: 'symbol',
      source: 'composite',
      'source-layer': 'place_label',
      minzoom: 1,
      layout: {
        'text-field': ['get', 'name_en'],
        'text-font': ['Open Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 1, 9, 4, 13],
      },
      paint: {
        'text-color': '#FFE66D',
        'text-opacity': 0.84,
        'text-halo-color': '#000000',
        'text-halo-width': 1.5,
      },
    },
  ],
} as mapboxgl.StyleSpecification;

const TravelGlobeMap = ({
  width = '100%',
  height = 500,
  mapboxToken,
  initialViewState = { longitude: 0, latitude: 0, zoom: 1 },
  markers = [],
  interactiveMarkers = true,
  showPhotoCards = true,
  onMarkerClick,
}: TravelGlobeMapProps) => {
  const [viewState, setViewState] = useState(initialViewState);
  const [selectedMarker, setSelectedMarker] = useState<TravelMarker | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const selectedImages = useMemo(() => pickImages(selectedMarker?.images), [selectedMarker]);

  const handleMarkerClick = useCallback(
    (marker: TravelMarker) => {
      setSelectedMarker(marker);
      onMarkerClick?.(marker);
    },
    [onMarkerClick]
  );

  const handleMove = (event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
  };

  if (!mapboxToken) {
    return (
      <div
        className="flex items-center justify-center border-2 border-[#FFE66D] bg-black p-6 text-center text-xs leading-6 text-[#FFE66D]"
        style={{ width, height }}
      >
        SET VITE_MAPBOX_TOKEN IN YOUR ENVIRONMENT TO LOAD THE JOURNEY MAP.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-black" style={{ width, height }}>
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(255,230,109,0.08)_1px,transparent_1px)] bg-[length:100%_6px] opacity-35" />
      <Map
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={darkPixelMapStyle}
        mapboxAccessToken={mapboxToken}
        onMove={handleMove}
        onClick={(event) => {
          if ((event.originalEvent.target as HTMLElement).classList.contains('mapboxgl-canvas')) {
            setSelectedMarker(null);
          }
        }}
        projection="globe"
        attributionControl={false}
        fog={{
          color: '#030303',
          'high-color': '#FFE66D',
          'horizon-blend': 0.06,
          'space-color': '#000000',
          'star-intensity': 0.9,
        }}
      >
        <NavigationControl showCompass={false} />

        {markers.map((marker) => {
          const size = marker.size ?? 18;
          const markerColor = getMarkerColor(marker);
          return (
            <Marker key={marker.id} longitude={marker.longitude} latitude={marker.latitude}>
              <button
                type="button"
                aria-label={marker.name ?? 'Travel marker'}
                onClick={interactiveMarkers ? () => handleMarkerClick(marker) : undefined}
                className="rounded-none border-2 border-black transition-transform hover:scale-125"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: markerColor,
                  boxShadow: `0 0 0 2px #FFE66D, 0 0 16px ${markerColor}`,
                  imageRendering: 'pixelated',
                }}
              />
            </Marker>
          );
        })}

        {selectedMarker && interactiveMarkers && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            onClose={() => setSelectedMarker(null)}
            closeButton
            closeOnClick={false}
            className="travel-map-popup"
          >
            <div className="max-w-xs bg-black text-[#FFE66D]">
              <h3 className="mb-2 text-sm font-bold">{selectedMarker.name}</h3>
              <p className="mb-2 text-xs leading-5">{selectedMarker.description}</p>
              <div className="text-[0.65rem] opacity-70">
                {selectedMarker.latitude.toFixed(4)}, {selectedMarker.longitude.toFixed(4)}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {showPhotoCards && selectedMarker && selectedImages.length > 0 && (
        <div className="pointer-events-auto absolute bottom-5 left-1/2 z-20 flex w-[92%] -translate-x-1/2 gap-3 overflow-x-auto p-3 terminal-scrollbar md:w-auto md:max-w-[80%]">
          {selectedImages.map((src, index) => (
            <button
              type="button"
              key={src}
              onClick={() => setSelectedImage(src)}
              className="group h-24 w-24 flex-shrink-0 border-2 border-[#FFE66D] bg-black transition-all duration-300 hover:z-10 hover:-translate-y-4 hover:scale-125 hover:shadow-[0_0_24px_#FFE66D] md:h-32 md:w-32"
              style={{ rotate: `${(index - 2) * 2}deg` }}
            >
              <img
                src={src}
                alt={`${selectedMarker.name ?? 'Travel'} ${index + 1}`}
                className="h-full w-full object-cover transition-all duration-300 group-hover:saturate-150"
              />
            </button>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-6" onClick={() => setSelectedImage(null)}>
          <button
            type="button"
            className="absolute right-5 top-5 border-2 border-[#FFE66D] bg-black px-3 py-2 text-[#FFE66D] hover:bg-[#FFE66D] hover:text-black"
            onClick={() => setSelectedImage(null)}
          >
            X
          </button>
          <img src={selectedImage} alt="Travel fullscreen" className="max-h-[90vh] max-w-[90vw] border-2 border-[#FFE66D] object-contain" />
        </div>
      )}

      <style>{`
        .travel-map-popup .mapboxgl-popup-content {
          background: #000 !important;
          border: 2px solid #FFE66D !important;
          border-radius: 0 !important;
          box-shadow: 0 0 18px rgba(255, 230, 109, 0.38) !important;
          color: #FFE66D !important;
          padding: 12px !important;
        }
        .travel-map-popup .mapboxgl-popup-tip {
          border-top-color: #FFE66D !important;
          border-bottom-color: #FFE66D !important;
        }
        .travel-map-popup .mapboxgl-popup-close-button {
          color: #FFE66D !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }
        .travel-map-popup .mapboxgl-popup-close-button:hover {
          background: #FFE66D !important;
          color: #000 !important;
        }
        .mapboxgl-ctrl-group {
          background: #000 !important;
          border: 2px solid #FFE66D !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .mapboxgl-ctrl-group button {
          background: #000 !important;
          color: #FFE66D !important;
          filter: invert(88%) sepia(51%) saturate(438%) hue-rotate(352deg) brightness(104%) contrast(101%);
        }
      `}</style>
    </div>
  );
};

export default TravelGlobeMap;
