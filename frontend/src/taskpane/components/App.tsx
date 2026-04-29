import * as React from "react";
import Header from "./Header/Header";
import AnalysisPanel from "./AnalysisPanel/AnalysisPanel";
import './App.css';

type Props = {
  title: string;
};

function App(props: Props) {
  return (
    <div className="container">
      <Header title={props.title} />
      <AnalysisPanel/>
    </div>
  );
}

export default App; 