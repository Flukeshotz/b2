import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import B2App from "../src/screens/b2/B2App";
import ErrorBoundary from "../src/components/ErrorBoundary";
import "../src/styles.css";
import "./b2app.css";

/* Skillcase B2 — its own product, its own server, its own front door.
   It shares a codebase and an account with the A1 app (outcome capture depends
   on reaching a learner weeks after they stop using it) but it is not a level
   inside that product: different audience, different loop, and none of the
   journey map, streak or coin machinery a beginner needs.
   Opening it should not land you in someone else's app. */

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div id="frame" className="frame">
      <ErrorBoundary>
        {/* Standalone: there is nowhere to exit to, so B2 owns the whole surface. */}
        <B2App onExit={() => window.location.reload()} />
      </ErrorBoundary>
    </div>
  </StrictMode>
);
