import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import FilterBoxList, {
  updateActiveTypeStates,
} from "~/components/FilterBoxList";
import FilterBoxPrice, {
  updateActivePriceStates,
} from "~/components/FilterBoxPrice";
import { useDispatch, useSelector } from "react-redux";
import { toggleType } from "~/store/filterSlice";
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

type FilterBoxProps = {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

const FilterBox: React.FC<FilterBoxProps> = ({
  children,
  isOpen = true,
  onOpen = () => { },
  onClose = () => { },
}: FilterBoxProps) => {
  const dispatch = useDispatch();

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const toggleFilter = (optionId: string) => {
    // ("toggleFilter", optionId);
    dispatch(toggleType({ pfType: optionId }));
  };

  const options1_with_state = updateActiveTypeStates(OPTIONS_1, activeTypes);
  const options2_with_state = updateActiveTypeStates(OPTIONS_2, activeTypes);
  const options_price_with_state = updateActivePriceStates(OPTIONS_PRICE, []);

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
