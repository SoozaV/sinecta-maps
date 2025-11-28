import { memo, useMemo } from "react";
import sinectaLogo from "../images/sinecta.png";
import mobileLogo from "../images/sinecta-logo.png";
import useWindowDimensions from "../hooks/useWindowDimension";

function SinectaLogo() {
  const { width } = useWindowDimensions();

  const logoProps = useMemo(() => ({
    src: width >= 768 ? sinectaLogo : mobileLogo,
    style: {
      maxWidth: width >= 768 ? "160px" : "50px",
      position: "absolute" as const,
      right: 30,
      bottom: 30,
    },
    alt: "Sinecta Logo",
  }), [width]);

  return <img {...logoProps} />;
}

export default memo(SinectaLogo);
