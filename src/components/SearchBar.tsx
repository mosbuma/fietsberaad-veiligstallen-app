import * as React from "react";
import Input from '@mui/material/TextField';

function SearchBar({ fietsenstallingen = [] }: any) {
  return (
    <input
      type="search"
      name=""
      placeholder="Vind een stalling"
      className="w-full h-10"
    />
  );
}

export default SearchBar;
