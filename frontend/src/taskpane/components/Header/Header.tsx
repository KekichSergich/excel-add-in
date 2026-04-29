import * as React from "react";

type Props = {
  title: string;
};

function Header(props: Props) {
  return (
    <div>
      <h1>{props.title}</h1>
    </div>
  );
}

export default Header;