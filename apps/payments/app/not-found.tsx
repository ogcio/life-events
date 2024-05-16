import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "./[locale]/(hosted)/Header";
import Footer from "./[locale]/(hosted)/Footer";

// Using strings temporarly since locale is not working
export default async function () {
  return (
    <>
      <Header locale="en" />
      <div
        className="govie-width-container"
        style={{ maxWidth: "1440px", width: "100%" }}
      >
        <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
            }}
          >
            <h2 className="govie-heading-m">Not Found</h2>
            <p className="govie-body">
              Sorry, the requested resource could not be found
            </p>
            <a href="/">
              <button className="govie-button govie-button--primary">
                Return Home
              </button>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
