import { useState, useMemo, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

interface GeolocationInterface {
  lat: number;
  lng: number;
}

export default function Places() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR API KEY",
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}

function Map() {
  const [selected, setSelected] = useState<GeolocationInterface | null>(null);
  const [marker, setMarker] = useState<GeolocationInterface | null>(null);
  const onMapClick = (e: any) => {
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  useEffect(() => {
    setMarker(null);
  }, [selected]);

  return (
    <>
      <div className="places-container">
        <PlacesAutocomplete setSelected={setSelected} />
      </div>

      <GoogleMap
        zoom={10}
        center={selected ?? { lat: 43.45, lng: -80.49 }}
        mapContainerClassName="map-container"
        onClick={onMapClick}
      >
        {marker !== null ? <Marker position={marker} /> : null}
        {selected !== null && marker === null ? (
          <Marker position={selected ?? marker} />
        ) : null}
      </GoogleMap>
    </>
  );
}

const PlacesAutocomplete = ({
  setSelected,
}: {
  setSelected: React.Dispatch<
    React.SetStateAction<GeolocationInterface | null>
  >;
}) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (address: any) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = getLatLng(results[0]);
    setSelected({ lat, lng });
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className="combobox-input"
        placeholder="Search an address"
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
};
