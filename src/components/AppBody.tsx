import * as React from "react";

function AppBody({ children }: {children: any}) {
  return <div className="AppBody" style={{
    paddingTop: '64px'
  }}>
    <div className="p-4">
      {children}
    </div>
  </div>
}

export default AppBody;
