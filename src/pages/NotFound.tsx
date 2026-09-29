import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Clock } from "@phosphor-icons/react";
import { Button, LayerCard } from "@cloudflare/kumo";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full relative bg-white">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
        radial-gradient(125% 125% at 50% 90%, #ffffffff 40%, #14b8a6 100%)
      `,
          backgroundSize: "100% 100%",
        }}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <LayerCard className="p-8 w-full max-w-md text-center">
          <Clock size={40} className="text-primary mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-muted-foreground mb-6">
            That hour isn't on the clock — this page doesn't exist.
          </p>
          <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </LayerCard>
      </div>
    </div>
  );
};

export default NotFound;
