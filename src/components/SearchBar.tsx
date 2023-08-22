import * as React from "react";
import Input from "@mui/material/TextField";
import { setQuery } from "~/store/filterSlice";
import { useDispatch, useSelector } from "react-redux";

function SearchBar({
  afterHtml
}: {
  afterHtml?: any
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
          h-10
          w-full
          rounded-3xl
          px-4
          shadow-md
        "
        onChange={(e) => {
          dispatch(setQuery(e.target.value));
        }}
      />
      {afterHtml ? afterHtml : ''}
    </>
  );
}

export default SearchBar;
