import ReactDOM from "react-dom";
import { GarfishInit } from "./garfishInit";
import RootComponent from "./components/root";

const render = async (_ROOT) => {
	GarfishInit();
	ReactDOM.render(<_ROOT />, document.getElementById("root"));
};

render(RootComponent);

// 开启热更新：
if ((module as any).hot) {
	(module as any).hot.accept(["./components/root"], () => {
		const _ROOT = require("./components/root").default;
		render(_ROOT);
	});
}
