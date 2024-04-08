export default ({
  disabled,
  onClick,
  transform,
}: {
  disabled: boolean;
  transform: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        height: "25px",
        width: "25px",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="7"
        height="12"
        viewBox="0 0 7 12"
        fill="none"
        style={{
          transform: transform ? "rotate(180deg)" : "none",
        }}
      >
        <path d="M6 1L1 6L6 11" stroke="#505A5F" />
      </svg>
    </button>
  );
};
