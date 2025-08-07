import React, { JSX } from "react";

export type CodeVisualizerUIComponentProps = {
    text: string;
}

export const CodeVisualizerUIComponent: React.FC<CodeVisualizerUIComponentProps> = ({ text }: CodeVisualizerUIComponentProps): JSX.Element => {
    return <div>{text}</div>
};
