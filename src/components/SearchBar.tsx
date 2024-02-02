import * as React from "react";

interface SearchBarProps {
  value?: string;
  filterChanged: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
  afterHtml?: React.ReactNode | null;
}

function SearchBar({
  value = "",
  filterChanged = undefined,
  afterHtml = null
}: SearchBarProps) {
  return (
    <>
      <input
        type="search"
        name=""
        placeholder="Vind een stalling"
        className="
          sticky top-0 z-10
          h-12
          w-full
          rounded-3xl
          px-4
          shadow-md
        "
        onChange={filterChanged}
        value={value}
      />
      {afterHtml}
    </>
  );
}

export default SearchBar;