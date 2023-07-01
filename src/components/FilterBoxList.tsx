import { useState } from "react";
import { FilterState } from "~/store/filterSlice";

import { RadioButton } from "~/components/Button";

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
export const updateActiveTypeStates = (
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
      {(title && title.length >= 1) ? <h2 className="font-bold text-lg poppinsbold pb-2">
        {title}
      </h2> : ''}
      <div className="pt-1 flex flex-col justify-between text-sm">
        {options.map((option, index) => (
          <RadioButton
            key={option.id}
            isActive={option.active}
            onClick={() => onToggleFilter(option.id)}
          >
            {option.title}
          </RadioButton>
        ))}
      </div>
    </div>
  );
};

export default FilterBoxList;
