import React from "react";
import { JSX } from "react/jsx-runtime";
import { MemoryValue } from "../modules/debugger";

export type MemoryUsageUIComponentProps = {
	[K in keyof MemoryValue]: number;
}

export const MemoryUsageUIComponent: React.FC<MemoryUsageUIComponentProps> = ({rss, heapTotal, heapUsed, external}): JSX.Element => {
	return (
		<div>
		<span>rss: {(rss / 1024 / 1024).toFixed(2)} mb </span>	
		<span>heapTotal: {(heapTotal / 1024 / 1024).toFixed(2)} mb </span>	
		<span>heapUsed: {(heapUsed / 1024 / 1024).toFixed(2)} mb </span>	
		<span>external: {(external / 1024 / 1024).toFixed(2)} mb </span>	
		</div>
	);	
};
