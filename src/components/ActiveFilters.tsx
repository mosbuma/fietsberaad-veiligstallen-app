// ActiveFilters.tsx - Location specific logo
import * as React from "react";
import { useSelector } from "react-redux";
import { AppState } from "~/store/store";

import FilterBoxList, {
  updateActiveTypeStates,
} from "~/components/FilterBoxList";

const ALL_PARKING_TYPES = [
  {
    id: "bewaakt",
    name: "bewaakt",
    title: "Bewaakte stalling",
    active: true,
  },
  {
    id: "geautomatiseerd",
    name: "geautomatiseerd",
    title: "Geautomatiseerde stalling",
    active: true,
  },
  {
    id: "onbewaakt",
    name: "publiek",
    title: "Onbewaakte stalling",
    active: true,
  },
  {
    id: "toezicht",
    name: "toezicht",
    title: "Stalling met toezicht",
    active: true,
  },
  {
    id: "buurtstalling",
    name: "buurtstalling",
    title: "Buurtstalling",
    active: true,
  },
  {
    id: "fietstrommel",
    name: "fietstrommel",
    title: "Fietsentrommel",
    active: true,
  },
  {
    id: "fietskluizen",
    name: "fietskluizen",
    title: "Fietskluis",
    active: true,
  },
];

function ActiveFilters({}: {}) {
  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const isAuthenticated = useSelector(
    (state: AppState) => state.map.municipality.code
  );

  const parkingTypes = updateActiveTypeStates(ALL_PARKING_TYPES, activeTypes);

  return (
    <>
      <FilterBoxList
        title={null}
        options={parkingTypes}
        onToggleFilter={() => {}}
      />
    </>
  );
}

export default ActiveFilters;
