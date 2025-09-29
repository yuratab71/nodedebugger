import { Component } from "react";
import { Box } from "@mui/material";
import { AppWrapper } from "./appWrapper.component";
import FileExplorer from "./components/fileExplorer/fileExlorer.component";
import { Editor } from "./components/editor/editor.component";
import { Stats } from "./components/stats/stats.components";

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
    constructor(props: AppProps) {
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

    onFileClick = async (url: string, inspectorUrl: string) => {
        if (url === this.state.selectedEntryUrl) return;
        console.log("fileclick");
        const value = await window.electronAPI.getFileContent(url);
        this.setState((prevState) => ({
            ...prevState,
            selectedEntryUrl: url,
            selectedEntryInspectorUrl: inspectorUrl,
            editorValue: value,
        }));
    };

    onPosChange = (line: number, col: number) => {
        this.setState((prevState) => ({
            ...prevState,
            pos: {
                line,
                col,
            },
        }));
    };

    onSetBreakpointByUrl = () => {
        console.log("here");
        window.electronAPI.setBreakpointByUrl({
            url: "file:///" + this.state.selectedEntryInspectorUrl,
            lineNumber: this.state.pos.line,
            columnNumber: this.state.pos.col,
        });
    };

    override render(): React.ReactNode {
        return (
            <AppWrapper>
                <Box display="flex" margin={0} padding={0}>
                    <FileExplorer onClick={this.onFileClick} />
                    <Editor
                        onSetBreakpointByUrl={this.onSetBreakpointByUrl}
                        onPosChange={this.onPosChange}
                        value={this.state.editorValue}
                    />
                    <Stats pos={this.state.pos} />
                </Box>
            </AppWrapper>
        );
    }
}
