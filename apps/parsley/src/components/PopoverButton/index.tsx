import { RefObject, useRef, useState } from "react";
import Button, { ButtonProps } from "@leafygreen-ui/button";
import Card from "@leafygreen-ui/card";
import Popover from "@leafygreen-ui/popover";
import Icon from "components/Icon";
import { useOnClickOutside } from "hooks";

interface PopoverButtonProps extends Omit<ButtonProps, "children"> {
  children: React.ReactNode;
  onClick?: () => void;
  buttonText: React.ReactNode | string;
  buttonRef: RefObject<HTMLButtonElement>;
}

const PopoverButton: React.FC<PopoverButtonProps> = ({
  buttonRef,
  buttonText,
  children,
  onClick,
  variant,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useOnClickOutside([buttonRef, popoverRef], () => {
    setIsOpen(false);
  });

  const handleClick = () => {
    setIsOpen(!isOpen);
    onClick?.();
  };

  return (
    <Button
      ref={buttonRef}
      data-variant={variant}
      onClick={handleClick}
      rightGlyph={<Icon glyph="CaretDown" />}
      size="small"
      variant={variant}
      {...rest}
    >
      {buttonText}
      <Popover active={isOpen} onClick={(e) => e.stopPropagation()}>
        <div ref={popoverRef}>
          <Card>{children}</Card>
        </div>
      </Popover>
    </Button>
  );
};

export default PopoverButton;
