export default (props: {
  onCancelAction: () => void;
  onDeleteAction: (formData: FormData) => void;
  toDelete: string;
  id: string;
}) => (
  <div
    className="govie-modal"
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      height: "100vh",
      width: "100vw",
    }}
  >
    <div className="govie-modal--overlay"></div>
    <div className="govie-modal--content">
      <div className="govie-modal--close-button-container">
        <span data-module="govie-tooltip">
          <form action={props.onCancelAction}>
            <button
              data-module="govie-icon-button"
              className="govie-icon-button"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                  fill="#505A5F"
                ></path>
              </svg>
              <span className="govie-visually-hidden">Close</span>
            </button>
          </form>
          <span className="govie-tooltip govie-tooltip--undefined">Close</span>
        </span>
      </div>
      <h1 className="govie-heading-s">
        Are you sure you want to delete the resource?
      </h1>

      <p className="govie-body">
        This action is not reversible and will permanently delete
        <br />
        <b>{props.toDelete}</b>.
      </p>

      {/* govie modal buttons set up a min width 45% on buttons. We elevate this to forms that needs to wrap for server actions */}
      <div className="govie-modal--buttons">
        <form action={props.onCancelAction} style={{ width: "45%" }}>
          <button
            id="cancel button"
            data-module="govie-button"
            className="govie-button govie-button--medium govie-button--outlined"
            style={{ width: "100%" }}
          >
            Keep it
          </button>
        </form>
        <form action={props.onDeleteAction} style={{ width: "45%" }}>
          <button
            id="confirm button"
            data-module="govie-button"
            className="govie-button govie-button--medium "
            style={{ width: "100%" }}
          >
            Delete
          </button>
          <input type="hidden" name="id" value={props.id} />
        </form>
      </div>
    </div>
  </div>
);
