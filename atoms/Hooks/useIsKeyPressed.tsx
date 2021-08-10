/**
 * From https://dev.to/n1ru4l/homebrew-react-hooks-useiskeypressed-33do
 */
import React from "react";


const useIsKeyPressed = (key) => {
  const [isKeyPressed, setIsKeyPressed] = React.useState(false);

  React.useEffect(() => {
    setIsKeyPressed(false);
    const onKeyDown = (ev) => {
      if (ev.key === key) setIsKeyPressed(true);
    };
    const onKeyUp = (ev) => {
      if (ev.key === key || ev.key === "Meta") setIsKeyPressed(false);
    };
    const onBlur = (ev) => {
      setIsKeyPressed(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onBlur);
    };
  }, [key]);

  return isKeyPressed;
};

export default useIsKeyPressed;