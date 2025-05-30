import { LeafygreenIconProps } from "../../types";

export const Failure: React.ComponentType<LeafygreenIconProps> = ({
  className,
  fill,
  size = 16,
}) => (
  <svg
    aria-label="Failure Icon"
    className={className}
    fill="currentColor"
    height={size}
    viewBox="0 0 21 21"
    width={size}
  >
    <path
      d="M17.7783.807588c-.7811-.7810482-2.0474-.7810486-2.8285 0L10.0001 5.75734 5.05035.807588c-.78105-.7810484-2.04738-.7810482-2.82843 0L.80771 2.2218c-.7810481.78105-.7810485 2.04738 0 2.82843l4.94975 4.94975L.80771 14.9497c-.7810474.7811-.7810481 2.0474 0 2.8285l1.41421 1.4142c.78105.781 2.04738.781 2.82843 0l4.94975-4.9498 4.9497 4.9498c.7811.781 2.0474.781 2.8285 0l1.4142-1.4142c.781-.7811.781-2.0474 0-2.8285l-4.9498-4.94972 4.9498-4.94975c.781-.78105.781-2.04738 0-2.82843L17.7783.807588Z"
      fill={fill}
    />
  </svg>
);
