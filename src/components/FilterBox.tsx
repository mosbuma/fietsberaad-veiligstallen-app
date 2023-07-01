import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import { AiFillMinusCircle } from "react-icons/ai";
import FilterBoxList, { updateActiveTypeStates } from "~/components/FilterBoxList";
import FilterBoxPrice, { updateActivePriceStates } from "~/components/FilterBoxPrice";
import { useDispatch, useSelector } from "react-redux";
import { toggleType } from "~/store/filterSlice";
import { AppState } from "~/store/store";

const OPTIONS_1 = [
  { id: "bewaakt", title: "Bewaakte stalling", active: false },
  { id: "geautomatiseerd", title: "Geautomatiseerde stalling", active: false },
  { id: "onbewaakt", title: "Onbewaakte stalling", active: false },
  { id: "toezicht", title: "Stalling met toezicht", active: false },
];

const OPTIONS_2 = [
  { id: "buurtstalling", title: "Buurtstalling", active: false },
  { id: "fietstrommel", title: "Fietsentrommel", active: false },
  { id: "fietskluizen", title: "Fietskluis", active: false },
];

const OPTIONS_PRICE = [
  { id: "per_uur", title: "Per uur", active: false },
  { id: "per_dag", title: "Per dag", active: false },
  { id: "jaarabonnement", title: "Jaarabonnement", active: false }
];

type FilterBoxProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const FilterBox: React.FC<FilterBoxProps> = ({
  children,
  isOpen,
  onOpen,
  onClose,
  onReset,
}) => {
  const dispatch = useDispatch();
  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const toggleFilter = (optionId: string) => {
    console.log("toggleFilter", optionId);
    dispatch(toggleType({ pfType: optionId }));
  };

  const options1_with_state = updateActiveTypeStates(OPTIONS_1, activeTypes);
  const options2_with_state = updateActiveTypeStates(OPTIONS_2, activeTypes);
  const options_price_with_state = updateActivePriceStates(OPTIONS_PRICE, activeTypes);

  return (
    <div
      className={`h-auto border-t border-gray-200 bg-white rounded-xl ${
        isOpen ? "" : "h-16"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="mx-auto max-w-7xl py-5 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <div className="w-6/12 mr-3">
            <FilterBoxList
              title="Publieke Stalling"
              options={options1_with_state}
              onToggleFilter={toggleFilter}
            />
          </div>
          <div className="w-6/12">
            <FilterBoxList
              title="Private Stalling"
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

        {children}
        
        <div className="mt-2 flex justify-center">
          <button
            className={`
              bg-black
              text-white
              rounded-md
              py-1
              px-3
              flex
            `}
            onClick={isOpen ? onClose : onOpen}
            aria-expanded={isOpen}
          >
            <div className="flex flex-col justify-center h-full mr-2">
              <AiFillMinusCircle size={20} color="white" />
            </div>
            Minder filters
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBox;
