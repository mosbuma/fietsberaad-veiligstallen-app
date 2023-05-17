import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import FilterBoxList, { updateActiveStates } from "~/components/FilterBoxList";
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

  const options1_with_state = updateActiveStates(OPTIONS_1, activeTypes);
  const options2_with_state = updateActiveStates(OPTIONS_2, activeTypes);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 h-auto border-t border-gray-200 bg-white ${
        isOpen ? "" : "h-16"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <FilterBoxList
            title="Publieke Stalling"
            options={options1_with_state}
            onToggleFilter={toggleFilter}
          />
          <FilterBoxList
            title="Private Stalling"
            options={options2_with_state}
            onToggleFilter={toggleFilter}
          />
        </div>
        {children}
        <div className="mt-2 flex justify-center">
          <button
            className="text-gray-700 hover:text-gray-900"
            onClick={isOpen ? onClose : onOpen}
            aria-expanded={isOpen}
          >
            <FiFilter size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBox;
