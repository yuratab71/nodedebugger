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

    public override render(): React.ReactNode {
        return (
            <AppWrapper>
                <Box display="flex" margin={0} padding={0}>
                    <FileExplorer />
                    <Editor />
                    <Stats />
                </Box>
            </AppWrapper>
        );
    }
}
