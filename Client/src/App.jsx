import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Layout/Navbar";

export default function App() {
  useEffect(() => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

    if (!facebookAppId) return;
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: false,
        version: "v23.0",
      });
    };

    const existingScript = document.getElementById("facebook-jssdk");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";

    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AppRoutes />
    </div>
  );
}