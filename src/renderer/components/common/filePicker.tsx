import React, { JSX } from "react";
import { Button } from "./button";

export const FilePickerUIComponent: React.FC<{}> = (
): JSX.Element => {
  
    const onClick: React.MouseEventHandler<HTMLButtonElement> = (): void => {
        window.electronAPI.setSubprocessDirectory();        
    }
    return (
    <Button text="Open dir" onClick={onClick}/>
    );
};
