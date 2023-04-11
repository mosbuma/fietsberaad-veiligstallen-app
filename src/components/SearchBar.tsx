import * as React from "react";
import Input from '@mui/material/TextField';

function SearchBar({ fietsenstallingen = [] }: any) {
  return (
    <div>
      <input
        type="search"
        name=""
        placeholder="Vind een stalling"
      />
    </div>
  );
}

export default SearchBar;
