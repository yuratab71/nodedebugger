import { Entry } from "../../../main/types/fileManager.types";
import { RichTreeView, TreeViewBaseItem } from "@mui/x-tree-view";
import { Box } from "@mui/material";
import { Component, ReactNode, SyntheticEvent } from "react";
import { GlobalState } from "@/renderer/redux/store";
import {
    AddParsedFileAction,
    ADD_PARSED_FILE,
    ParsedFilesState,
} from "@/renderer/redux/parsedFiles.reducer";
import { connect } from "react-redux";

type TreeViewBaseItemExtended = TreeViewBaseItem & { inspectorUrl: string };

interface StateProps {
    parsedFiles: ParsedFilesState;
}

interface DispatchProps {
    addParsedFiles: (files: Entry[]) => void;
}

type FileExplorerProps = StateProps & DispatchProps;

class FileExplorer extends Component<FileExplorerProps> {
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
        //        await this.props.onClick(itemId, itemId);
    };

    treeItems: TreeViewBaseItem[] = [];

    onItemClick = (
        _: React.MouseEvent<Element, MouseEvent>,
        itemId: string,
    ) => {
        //       this.props.onClick(itemId, itemId);
    };

    override render(): ReactNode {
        return (
            <Box width="182px" height="90vh">
                <RichTreeView
                    sx={{ marginTop: 0 }}
                    onItemClick={this.onItemClick}
                    items={this.props.parsedFiles.map(
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
        parsedFiles: state.parsedFiles,
    };
};

const mapDispatchToProps: DispatchProps = {
    addParsedFiles: (files: Entry[]) => {
        const action: AddParsedFileAction = {
            type: ADD_PARSED_FILE,
            parsedFiles: files,
        };

        return action;
    },
};

export default connect(mapStateToProps, mapDispatchToProps)(FileExplorer);
