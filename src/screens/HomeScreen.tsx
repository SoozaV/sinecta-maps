import { MapView, Polygons } from "../components";
import { GeoJSONControls } from "../components/GeoJSONControls";
import SinectaLogo from "../components/SinectaLogo";

export const HomeScreen = () => {
  return (
    <div className="container-fluid">
      <div className="row flex-column flex-md-row polygons-row">
        <aside
          className="col col-md-4 py-3 polygons-sidebar"
          style={{ maxHeight: "100vh", display: "flex", flexDirection: "column" }}
        >
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Polygons />
          </div>
          <GeoJSONControls />
        </aside>
        <div className="loaded-map col col-md-8 p-0">
          <MapView />
        </div>
        <SinectaLogo />
      </div>
    </div>
  );
};
