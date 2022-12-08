import { BtnMyLocation, MapView, Polygons } from "../components";

export const HomeScreen = () => {
  return (
    <div className="container-fluid">
      {/*<BtnMyLocation />*/}
      <div className="row">
        <aside className="col-3">
          <Polygons />
        </aside>
        <MapView />
      </div>
    </div>
  );
};
