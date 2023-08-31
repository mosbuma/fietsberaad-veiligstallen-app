// ActiveFilters.tsx - Location specific logo
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "~/store/store";
import { useRouter } from 'next/router'

import { setTypes } from "~/store/filterSlice";

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
    id: "toezicht",
    name: "toezicht",
    title: "Stalling met toezicht",
    active: true,
  },
  {
    id: "onbewaakt",
    name: "publiek",
    title: "Onbewaakte stalling",
    active: false,
  },
  {
    id: "buurtstalling",
    name: "buurtstalling",
    title: "Buurtstalling",
    active: false,
  },
  {
    id: "fietstrommel",
    name: "fietstrommel",
    title: "Fietsentrommel",
    active: false,
  },
  {
    id: "fietskluizen",
    name: "fietskluizen",
    title: "Fietskluis",
    active: false,
  },
];

function ActiveFilters({}: {}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const isAuthenticated = useSelector(
    (state: AppState) => state.map.municipality.code
  );

  // If setFilter query param is set, set filter accordingly
  // Example URL: /?typesFilter=bewaakt,toezicht
  React.useEffect(() => {
    if(! router.query || ! router.query.typesFilter) {
      return;
    }

    const filterParams = router.query.typesFilter;
    setFilterFromParams(filterParams);
  }, [
    router.query
  ])

  const setFilterFromParams = (params) => {
    // Make an array out of params
    const paramsArray = params.split(',');
    // Stop if no params were found
    if(! paramsArray || paramsArray.length <= 0) return;
    // Loop parms
    const typesFilter = [];
    paramsArray.forEach(x => {
      typesFilter.push(x);
    });
    // Set in state
    dispatch(setTypes(typesFilter));
  }

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
