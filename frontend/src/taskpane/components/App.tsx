import * as React from "react";
import Header from "./Header";
import AnalysisPanel from "./AnalysisPanel";

type Props = {
  title: string;
};

function App(props: Props) {
  return (
    <div>
      <Header title={props.title} />
      <AnalysisPanel/>
    </div>
  );
}

export default App;