import { useState } from "react";
import { FilterState } from "~/store/filterSlice";

export type FilterBoxOption = {
  id: string;
  title: string;
  active: boolean;
};

type FilterBoxListProps = {
  title: string;
  options: FilterBoxOption[];
  onToggleFilter: (optionId: string) => void;
};

// utility functions
export const updateActiveStates = (
  options: FilterBoxOption[],
  activeTypes: string[]
): FilterBoxOption[] => {
  // Map over the options and update the `active` field based on whether
  // the option's `id` is included in the `activeTypes` array
  return options.map((option) => ({
    ...option,
    active: activeTypes.includes(option.id),
  }));
};

const FilterBoxList: React.FC<FilterBoxListProps> = ({
  title,
  options,
  onToggleFilter,
}) => {
  return (
    <div>
      <h2 className="pb-3 font-bold text-lg poppinsbold">
        {title}
      </h2>
      <div className="flex flex-col justify-between text-sm">
        {options.map((option, index) => (
          <button
            key={option.id}
            className={`
              py-1 px-2 mb-3
              text-left rounded-md
              whitespace-nowrap text-ellipsis overflow-hidden
              font-poppinsmedium
              text-base
              hover:shadow
              transition-all
              ${
                option.active
                  ? "border border-gray-700 shadow shadow-md"
                  : "border border-gray-400 bg-white text-gray-700"
              }
            `}
            onClick={() => onToggleFilter(option.id)}
            style={{ userSelect: "none" }} // disable highlighting
          >
            {option.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBoxList;
