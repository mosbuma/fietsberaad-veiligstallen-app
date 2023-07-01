import { useState } from "react";
import { FilterState } from "~/store/filterSlice";

import { RadioButton } from "~/components/Button";

export type FilterBoxPriceOption = {
  id: string;
  title: string;
  active: boolean;
};

type FilterBoxPriceProps = {
  title: string;
  options: FilterBoxPriceOption[];
  onToggleFilter: (optionId: string) => void;
};

// utility functions
export const updateActivePriceStates = (
  options: FilterBoxPriceOption[],
  activeTypes: string[]
): FilterBoxPriceOption[] => {
  // Map over the options and update the `active` field based on whether
  // the option's `id` is included in the `activeTypes` array
  return options.map((option) => ({
    ...option,
    active: activeTypes.includes(option.id),
  }));
};

const FilterBoxPrice: React.FC<FilterBoxPriceProps> = ({
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

export default FilterBoxPrice;
