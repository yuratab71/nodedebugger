import { Component } from "react";
import { Box } from "@mui/material";
import { AppWrapper } from "./appWrapper.component";
import { FileExplorer } from "./components/fileExplorer/fileExlorer.component";
import { Editor } from "./components/editor/editor.component";
import { Stats } from "./components/stats/stats.components";

interface AppProps {}
interface AppState {
    editorValue: string;
    pos: {
        line: number;
        col: number;
    };
    selectedEntry: string;
}

export default class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            editorValue: "",
            selectedEntry: "",
            pos: {
                line: 0,
                col: 0,
            },
        };
    }

    onFileClick = async (url: string) => {
        if (url === this.state.selectedEntry) return;
        console.log("fileclick");
        const value = await window.electronAPI.getFileContent(url);
        this.setState((prevState) => ({
            ...prevState,
            selectedEntry: url,
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
            url: this.state.selectedEntry,
            lineNumber: this.state.pos.line,
            columnNumber: this.state.pos.col,
        });
    };

    override render(): React.ReactNode {
        return (
            <AppWrapper>
                <Box display="flex" alignItems="center" margin={0} padding={0}>
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
