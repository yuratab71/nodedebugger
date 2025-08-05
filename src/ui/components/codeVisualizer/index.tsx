import React, { JSX } from "react";

export type CodeVisualizerUIComponentProps = {
    text: string;
}

export const CodeVisualizerUIComponent: React.FC<CodeVisualizerUIComponentProps> = ({ text: string }): JSX.Element => {
    return <div>Code Visualizer</div>;
};
