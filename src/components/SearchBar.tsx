import * as React from "react";
import Input from '@mui/material/TextField';

function SearchBar({ fietsenstallingen = [] }: any) {
  return (
    <input
      type="search"
      name=""
      placeholder="Vind een stalling"
      className="
        h-10 shadow-md rounded-3xl -mx-5
        px-3
      "
      style={{
        width: 'calc(100% + 2.5rem)'
      }}
    />
  );
}

export default SearchBar;
