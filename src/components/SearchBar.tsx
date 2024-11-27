import * as React from "react";
// import Input from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";

function SearchBar({
  value,
  filterChanged,
  afterHtml
}: {
  value?: string,
  filterChanged: Function,
  afterHtml?: any,
}) {
  const dispatch = useDispatch();

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
      {afterHtml ? afterHtml : ''}
    </>
  );
}

export default SearchBar;
