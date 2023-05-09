import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthState } from "~/store/authSlice";
// import { AppState } from "~/store/Store";

function AppHeader({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: AppState) => state.auth.authState
  );

  const handleLoginClick = () => {
    const authState = isAuthenticated ? false : true;
    dispatch(setAuthState(authState));
  };

  return (
    <div
      className="
        t-0
        fixed z-10
        flex
        h-10
        w-full
        justify-between
        px-5
        py-10
      "
    >
      <img
        src="https://huisstijl.utrecht.nl/typo3conf/ext/alternet_sitepackage/Resources/Public/Images/svg/wapen-utrecht-rood.svg"
        className="mr-2 h-10"
        alt="logo Gemeente Utrecht"
      />
      <div className="flex-1">{children}</div>
      <button
        className="
          mx-2
          h-10
          rounded-md
          bg-blue-500
          px-4
          font-bold
          text-white
          shadow-lg
          hover:bg-blue-700
        "
        onClick={handleLoginClick}
      >
        {isAuthenticated ? "Logout" : "Login"}
      </button>
    </div>
  );
}

export default AppHeader;
