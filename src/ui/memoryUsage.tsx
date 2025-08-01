import React from "react";
import { JSX } from "react/jsx-runtime";
import { MemoryValue } from "../modules/debuggigmessages";

export type MemoryUsageUIComponentProps = {
	[K in keyof MemoryValue]: number;
}

export const MemoryUsageUIComponent: React.FC<MemoryUsageUIComponentProps> = ({rss, heapTotal, heapUsed, external}): JSX.Element => {
	return (
		<div>
		<span>rss: {rss}</span>	
		<span>heapTotal: {heapTotal}</span>	
		<span>heapUsed: {heapUsed}</span>	
		<span>external: {external}</span>	
		</div>
	);	
};
