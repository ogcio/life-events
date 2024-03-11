import ds from "design-system";
import "./OpenEventStatusImage.css";

/**
 * This could arguably live in the design system depending on how likely it's to be shared
 */

type Props = {
  finished?: boolean;
};

export default (props: Props) => {
  return (
    <div
      style={{
        width: "70px",
        height: "70px",
        minHeight: "70px",
        minWidth: "70px",
        background: ds.hexToRgba(ds.colours.ogcio.gold, 15),
        margin: "5px",
        position: "relative",
      }}
    >
      {!props.finished ? (
        <svg
          style={{ position: "absolute", top: "-5px", left: "-5px" }}
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
        >
          <g fill="none" fillRule="evenodd">
            <path d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.105.074l.014.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018m.264-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.092l.01-.009l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
            <path
              fill={ds.colours.ogcio.green}
              d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m.005-14.242a1 1 0 0 0 0 1.414L13.833 11H7.757a1 1 0 0 0 0 2h6.076l-1.828 1.829a1 1 0 0 0 1.414 1.414l3.535-3.536a1 1 0 0 0 0-1.414L13.42 7.758a1 1 0 0 0-1.414 0Z"
            />
          </g>
        </svg>
      ) : (
        <svg
          style={{ position: "absolute", top: "-5px", left: "-5px" }}
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
        >
          <path
            fill={ds.colours.ogcio.green}
            d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22"
          />
        </svg>
      )}

      <ds.Icon
        icon="about"
        size={35}
        color={ds.colours.ogcio.darkGreen}
        className="open-event-icon-position"
      />
    </div>
  );
};
