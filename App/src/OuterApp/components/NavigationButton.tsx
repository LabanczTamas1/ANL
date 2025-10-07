import React from "react";
import ActionButton from "./ActionButton";
import { ActionButtonProps } from "./ActionButton";
import { Link } from "react-router-dom";

interface NavigationButtonProps extends ActionButtonProps {
  url: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  url,
  ...props
}) => {
  return (
    <Link to={url}>
      <ActionButton {...props} />
    </Link>
  );
};

export default NavigationButton;
