import { Component } from "react";
import { Debugger } from "@/main/types/debugger.types";
import { FileContent } from "@/main/types/fileManager.types";
import { AppWrapper } from "./appWrapper.component";
import Editor from "./components/editor/editor.component";
import FileExplorer from "./components/fileExplorer/fileExlorer.component";
import Stats from "./components/stats/stats.components";

interface AppProps {}
interface AppState {
	editorValue: string;
	pos: {
		line: number;
		col: number;
	};
	selectedEntryUrl: string;
	selectedEntryInspectorUrl: string;
	activeBreakpoints: Debugger.Breakpoint[];
}

export default class App extends Component<AppProps, AppState> {
	public constructor(props: AppProps) {
		super(props);
		this.state = {
			editorValue: "",
			selectedEntryUrl: "",
			selectedEntryInspectorUrl: "",
			pos: {
				line: 0,
				col: 0,
			},
			activeBreakpoints: [],
		};
	}

	public onFileClick = async (
		url: string,
		inspectorUrl: string,
	): Promise<void> => {
		if (url === this.state.selectedEntryUrl) return;
		const fileContent: FileContent =
			await window.electronAPI.getFileContent(url);
		this.setState((prevState) => ({
			...prevState,
			selectedEntryUrl: url,
			selectedEntryInspectorUrl: inspectorUrl,
			editorValue: fileContent.content,
			activeBreakpoints: fileContent.activeBreakpoints,
		}));
	};

	public override render(): React.ReactNode {
		return (
			<AppWrapper>
				<FileExplorer />
				<Editor />
				<Stats />
			</AppWrapper>
		);
	}
}
