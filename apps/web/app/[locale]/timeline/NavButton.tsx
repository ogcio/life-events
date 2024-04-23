import Link from "next/link";

type ButtonProps = {
  url: string;
  disabled: boolean;
  transform: boolean;
};

export default ({ disabled, transform, url }: ButtonProps) => {
  const ButtonContent = (
    <button
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        height: "25px",
        width: "25px",
        cursor: disabled ? "initial" : "pointer",
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

  if (!disabled) {
    return (
      <Link
        style={{
          display: "inline-block",
          cursor: "cursor",
        }}
        href={url}
      >
        {ButtonContent}
      </Link>
    );
  }

  return ButtonContent;
};
