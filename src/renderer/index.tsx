// import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <Provider store={store}>
        <App />,
    </Provider>,
    // </React.StrictMode>,
);

Object.defineProperty(window, "scrollTo", {
    value: (...args) => {
        console.log("scrollTo called with:", args);
    },
});
