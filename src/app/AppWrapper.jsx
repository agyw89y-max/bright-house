"use client";
import { useState } from "react";
import SplashScreen from "./components/SplashScreen"; // صح

import Home from "./Home";

export default function AppWrapper() {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <>
      {!introFinished && <SplashScreen onFinish={() => setIntroFinished(true)} />}
      {introFinished && <Home />}
    </>
  );
}
