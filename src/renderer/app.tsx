import { Box } from "@mui/material";
import { Component } from "react";
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
		};
	}

	public onFileClick = async (
		url: string,
		inspectorUrl: string,
	): Promise<void> => {
		if (url === this.state.selectedEntryUrl) return;
		const value = await window.electronAPI.getFileContent(url);
		this.setState((prevState) => ({
			...prevState,
			selectedEntryUrl: url,
			selectedEntryInspectorUrl: inspectorUrl,
			editorValue: value as string,
		}));
	};

	/**
    private onPosChange = (line: number, col: number): void => {
        this.setState((prevState) => ({
            ...prevState,
            pos: {
                line,
                col,
            },
        }));
    };

    private onSetBreakpointByUrl = (): void => {
        window.electronAPI.setBreakpointByUrl({
            url: "file:///" + this.state.selectedEntryInspectorUrl,
            lineNumber: this.state.pos.line,
            columnNumber: this.state.pos.col,
        });
    };
*/

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
