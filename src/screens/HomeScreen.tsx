import { BtnMyLocation, MapView, Polygons } from "../components";
import SinectaLogo from "../components/SinectaLogo";

export const HomeScreen = () => {
  return (
    <div className="container-fluid">
      {/*<BtnMyLocation />*/}
      <div className="row flex-column flex-md-row polygons-row">
        <aside className="col col-md-4 py-3 polygons-sidebar" style={{ maxHeight: "100vh" }}>
          <div className="mh-100 polygons-list-container">
            <Polygons />
          </div>
        </aside>
        <MapView />
        <SinectaLogo />
      </div>
    </div>
  );
};
