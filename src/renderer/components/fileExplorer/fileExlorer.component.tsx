import { Entry } from "../../../main/types/fileManager.types";
import { RichTreeView, TreeViewBaseItem } from "@mui/x-tree-view";
import { Box } from "@mui/material";
import { Component, ReactNode, SyntheticEvent } from "react";
import { GlobalState } from "@/renderer/redux/store";
import {
    AddParsedFileAction,
    ADD_PARSED_FILE,
    UPDATE_CURRENT_FILE,
    UpdateCurrentFileAction,
} from "@/renderer/redux/parsedFiles.reducer";
import { connect } from "react-redux";

type TreeViewBaseItemExtended = TreeViewBaseItem & { inspectorUrl: string };

interface StateProps {
    entries: Entry[];
    currentFileUrl: string | null;
}

interface DispatchProps {
    addParsedFiles: (files: Entry[]) => void;
    updateFile: (url: string, content: string) => void;
}

type FileExplorerProps = StateProps & DispatchProps;

class FileExplorer extends Component<FileExplorerProps> {
    treeItems: TreeViewBaseItem[] = [];

    override componentDidMount() {
        console.log("File explorer did mount");
        window.electronAPI.onParsedFilesUpdate((entries: Entry[]) => {
            this.props.addParsedFiles([...entries]);
        });
    }

    onItemFocus = async (
        _: SyntheticEvent<Element, Event> | null,
        itemId: string,
    ) => {
        if (itemId === this.props.currentFileUrl) return;

        this.props.updateFile(
            itemId,
            await window.electronAPI.getFileContent(itemId),
        );
    };

    onItemClick = async (
        _: React.MouseEvent<Element, MouseEvent>,
        itemId: string,
    ) => {
        if (itemId === this.props.currentFileUrl) return;

        this.props.updateFile(
            itemId,
            await window.electronAPI.getFileContent(itemId),
        );
    };

    override render(): ReactNode {
        return (
            <Box width="182px" height="90vh">
                <RichTreeView
                    sx={{ marginTop: 0 }}
                    onItemClick={this.onItemClick}
                    items={this.props.entries.map(
                        (entry: Entry): TreeViewBaseItemExtended => {
                            return {
                                id: entry.path,
                                label: "@:" + entry.name + entry.extension,
                                inspectorUrl: entry.inspectorUrl,
                                children: [
                                    ...entry?.sources?.map<TreeViewBaseItem>(
                                        (el: string) => {
                                            return {
                                                id: el ?? "undefined",
                                                label: el ?? "undefined",
                                                url: entry.path,
                                                inspectorUrl: entry.path,
                                            };
                                        },
                                    ),
                                ],
                            };
                        },
                    )}
                />
            </Box>
        );
    }
}

const mapStateToProps = (state: GlobalState): StateProps => {
    return {
        entries: state.parsedFiles.entries,
        currentFileUrl: state.parsedFiles.currentFileUrl,
    };
};

const mapDispatchToProps: DispatchProps = {
    addParsedFiles: (files: Entry[]) => {
        const action: AddParsedFileAction = {
            type: ADD_PARSED_FILE,
            data: files,
        };

        return action;
    },
    updateFile: (url: string, content: string) => {
        const action: UpdateCurrentFileAction = {
            type: UPDATE_CURRENT_FILE,
            data: {
                url,
                content,
            },
        };

        return action;
    },
};

export default connect(mapStateToProps, mapDispatchToProps)(FileExplorer);
