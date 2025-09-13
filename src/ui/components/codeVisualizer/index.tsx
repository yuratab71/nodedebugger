import React, { JSX, useEffect, useState } from "react";
import styled from "styled-components";
import { Entry } from "../../../modules/fileManager";
import { CodeViewerUIComponent } from "../codeViewer";
import { FileExplorerUIComponent } from "../fileExplorer";

const CodeVisualizerWrapper = styled.div`
    display: flex;
    width: 100%;
    padding: 5px;
`;

export type CodeVisualizerUIComponentProps = {
    rootDir: string;
};

export const CodeVisualizerUIComponent: React.FC<
    CodeVisualizerUIComponentProps
> = ({ rootDir }: CodeVisualizerUIComponentProps): JSX.Element => {
    const [currentDir, setCurrentDir] = useState<string>(rootDir);
    const [fileStructure, setFileStructure] = useState<Entry[]>([]);
    const [fileContent, setFileContent] = useState<string>("");
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        try {
            window.electronAPI.onFileStructureResolve((files) => {
                setFileStructure(files);
            });
        } catch (e) {
            console.log(e);
        }
    }, []);
    const handleClick = (entry: Entry) => {
        if (!entry.isDir) {
            window.electronAPI.getFileContent(entry.path).then((data) => {
                setFileContent(data);
                setUrl(entry.path);
            });

            window.electronAPI.getSourceMap(entry.path).then((data) => {
                if (data === null) {
                    console.log("received null: " + data);
                } else {
                    console.log(data);
                }
            });
            return;
        }

        setCurrentDir(entry.path);
        window.electronAPI
            .getFileStructure(entry.path)
            .then((files) => setFileStructure(files));
        return;
    };

    const onStepOutCallback = () => {
        const locParsed = currentDir.split("\\");
        locParsed.pop();
        const dest = locParsed.join("\\");
        setCurrentDir(dest);
        window.electronAPI
            .getFileStructure(dest)
            .then((files) => setFileStructure(files));
        return;
    };
    return (
        <CodeVisualizerWrapper>
            <FileExplorerUIComponent
                dir={currentDir ? currentDir : rootDir}
                canStepOutOfDir={currentDir != "" && currentDir != rootDir}
                onStepOutOfDirCallback={onStepOutCallback}
                files={fileStructure}
                onClickCallback={handleClick}
            />
            <CodeViewerUIComponent url={url} text={fileContent} />
        </CodeVisualizerWrapper>
    );
};
