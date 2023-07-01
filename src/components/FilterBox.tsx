import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import {
  AiFillMinusCircle, AiFillPlusCircle
} from "react-icons/ai";
import FilterBoxList, { updateActiveTypeStates } from "~/components/FilterBoxList";
import FilterBoxPrice, { updateActivePriceStates } from "~/components/FilterBoxPrice";
import { useDispatch, useSelector } from "react-redux";
import { toggleType } from "~/store/filterSlice";
import { AppState } from "~/store/store";

const OPTIONS_1 = [
  { id: "bewaakt", name: "bewaakt", title: "Bewaakte stalling", active: true },
  { id: "geautomatiseerd", name: "geautomatiseerd", title: "Geautomatiseerde stalling", active: true },
  { id: "onbewaakt", name: "publiek", title: "Onbewaakte stalling", active: true },
  { id: "toezicht", name: "toezicht", title: "Stalling met toezicht", active: true },
];

const OPTIONS_2 = [
  { id: "buurtstalling", name: "buurtstalling", title: "Buurtstalling", active: true },
  { id: "fietstrommel", name: "fietstrommel", title: "Fietsentrommel", active: true },
  { id: "fietskluizen", name: "fietskluizen", title: "Fietskluis", active: true },
];

const OPTIONS_PRICE = [
  { id: "per_uur", title: "Per uur", active: true },
  { id: "per_dag", title: "Per dag", active: true },
  { id: "jaarabonnement", title: "Jaarabonnement", active: true }
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
  const options_price_with_state = updateActivePriceStates(OPTIONS_PRICE, []);

  return (
    <div
      className={`h-auto border-t border-gray-200 bg-white rounded-xl ${
        isOpen ? "" : "h-16"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="mx-auto max-w-7xl py-5 px-4 sm:px-6 lg:px-8">
        <div className={`
          ${isOpen ? 'flex justify-between' : ''}
        `}>
          <div className={`
            ${isOpen ? 'w-6/12 mr-3' : ''}
          `}>
            <FilterBoxList
              title={`${isOpen ? 'Publieke Stalling' : ''}`}
              options={options1_with_state}
              onToggleFilter={toggleFilter}
            />
          </div>
          <div className={`
            ${isOpen ? 'w-6/12 mr-3' : ''}
          `}>
            <FilterBoxList
              title={`${isOpen ? 'Private Stalling' : ''}`}
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
        
        <div className="hidden">
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

            {isOpen && <>
              <div className="flex flex-col justify-center h-full mr-2">
                <AiFillMinusCircle size={20} color="white" />
              </div>
              Minder filters
            </>}

            {! isOpen && <>
              <div className="flex flex-col justify-center h-full mr-2">
                <AiFillPlusCircle size={20} color="white" />
              </div>
              Meer filters
            </>}

          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBox;
