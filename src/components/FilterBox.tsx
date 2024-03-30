// @ts-nocheck

import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import FilterBoxList, {
  updateActiveTypeStates,
} from "~/components/FilterBoxList";
import FilterBoxPrice, {
  updateActivePriceStates,
} from "~/components/FilterBoxPrice";
import { useDispatch, useSelector } from "react-redux";
import { toggleType, toggleType2 } from "~/store/filterSlice";
import { AppState } from "~/store/store";

const OPTIONS_1 = [
  {
    id: "bewaakt",
    name: "bewaakt",
    title: "Bewaakte stalling",
    active: true
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
];

const OPTIONS_2 = [
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

const OPTIONS_PRICE = [
  { id: "per_uur", title: "Per uur", active: true },
  { id: "per_dag", title: "Per dag", active: true },
  { id: "jaarabonnement", title: "Jaarabonnement", active: true },
];

const OPTIONS_SUBMISSIONS = [
  {
    id: "show_submissions",
    name: "show_submissions",
    title: "Toon aanmeldingen",
    active: false,
  },
];

type FilterBoxProps = {
  children?: React.ReactNode;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onReset: () => void;
};

const FilterBox: React.FC<FilterBoxProps> = ({
  children,
  isOpen,
  onOpen,
  onClose,
  onReset,
}: {
  children?: any;
  isOpen: boolean;
  onOpen: Function;
  onClose: Function;
  onReset: Function;
}) => {
  const dispatch = useDispatch();
  const { data: session } = useSession()

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const toggleFilter = (optionId: string) => {
    // ("toggleFilter", optionId);
    dispatch(toggleType({ pfType: optionId }));
  };

  const activeTypes2 = useSelector(
    (state: AppState) => state.filter.activeTypes2
  );

  const toggleFilter2 = (optionId: string) => {
    // ("toggleFilter", optionId);
    dispatch(toggleType2({ pfType: optionId }));
  };

  const options1_with_state = updateActiveTypeStates(OPTIONS_1, activeTypes);
  const options2_with_state = updateActiveTypeStates(OPTIONS_2, activeTypes);
  const options_price_with_state = updateActivePriceStates(OPTIONS_PRICE, []);
  const options3_with_state = updateActiveTypeStates(OPTIONS_SUBMISSIONS, activeTypes2);

  return (
    <div
      className={`h-auto rounded-xl border-t border-gray-200 bg-white ${isOpen ? "" : "h-16"
        } transition-all duration-300 ease-in-out`}
    >
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div
          className={`
          ${isOpen ? "flex justify-between" : ""}
        `}
        >
          <div
            className={`
            ${isOpen ? "mr-3 w-6/12" : ""}
          `}
          >
            <FilterBoxList
              title={`${isOpen ? "Publieke Stalling" : ""}`}
              options={options1_with_state}
              onToggleFilter={toggleFilter}
            />
          </div>
          <div
            className={`
              ${isOpen ? "mr-3 w-6/12" : ""}
            `}
          >
            <FilterBoxList
              title={`${isOpen ? "Private Stalling" : ""}`}
              options={options2_with_state}
              onToggleFilter={toggleFilter}
            />
          </div>
        </div>

        <div className="hidden">
          <FilterBoxPrice
            title="Prijs"
            options={options_price_with_state}
            onToggleFilter={toggleFilter}
          />
        </div>

        {session && session.user ?
          <div className="mt-5">
            <FilterBoxList
              title=""
              options={options3_with_state}
              onToggleFilter={toggleFilter2}
            />
          </div> : null}

        {children}

        <div className="hidden">
          <button
            className={`
              flex
              rounded-md
              bg-black
              px-3
              py-1
              text-white
            `}
            onClick={() => {
              isOpen ? onClose() : onOpen();
            }}
            aria-expanded={isOpen}
          >
            {isOpen && (
              <>
                <div className="mr-2 flex h-full flex-col justify-center">
                  <AiFillMinusCircle size={20} color="white" />
                </div>
                Minder filters
              </>
            )}

            {!isOpen && (
              <>
                <div className="mr-2 flex h-full flex-col justify-center">
                  <AiFillPlusCircle size={20} color="white" />
                </div>
                Meer filters
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBox;
