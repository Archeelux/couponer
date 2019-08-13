import logMessage from "./assets/js/logger";
import "./assets/css/style.css";

// Log message to console
logMessage("Its finished!!");

// Needed for Hot Module Replacement
if (typeof module.hot !== "undefined") {
    module.hot.accept(); // eslint-disable-line no-undef
}
