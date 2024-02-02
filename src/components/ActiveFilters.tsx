// ActiveFilters.tsx - Location specific logo
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "~/store/store";
import { useRouter } from 'next/router'

import { setTypes } from "~/store/filterSlice";
import { getQueryParameterString } from "~/utils/query";

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

function ActiveFilters({ }: {}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  // If setFilter query param is set, set filter accordingly
  // Example URL: /?typesFilter=bewaakt,toezicht
  React.useEffect(() => {
    const filterParams = getQueryParameterString(router.query, "typesFilter");
    if (undefined === filterParams) {
      return;
    }
    setFilterFromParams(filterParams);
  }, [
    router.query
  ])

  const setFilterFromParams = (params: string) => {
    const typesFilter = params.split(',');
    if (!typesFilter) return;
    dispatch(setTypes(typesFilter));
  }

  const parkingTypes = updateActiveTypeStates(ALL_PARKING_TYPES, activeTypes);

  return (
    <>
      <FilterBoxList
        title={""}
        options={parkingTypes}
        onToggleFilter={() => { }}
      />
    </>
  );
}

export default ActiveFilters;
