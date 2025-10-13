// import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app";
import store from "./redux/store";
import "./index.css";

// biome-ignore lint: non-null assertion for root element
ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<App />,
	</Provider>,
);
