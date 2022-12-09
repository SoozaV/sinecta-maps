import sinectaLogo from "../images/sinecta.png";
import mobileLogo from "../images/sinecta-logo.png";
import useWindowDimensions from "../hooks/useWindowDimension";

export default function SinectaLogo() {
  const { width } = useWindowDimensions();

  return (
    <img
      src={width >= 768 ? sinectaLogo : mobileLogo}
      style={{
        maxWidth: width >= 768 ? "160px" : "50px",
        position: "absolute",
        right: 30,
        bottom: 30,
      }}
      alt=""
    />
  );
}
