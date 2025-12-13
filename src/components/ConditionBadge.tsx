import React from "react";

export type ConditionType = "good" | "fair" | "poor" | string;

interface ConditionBadgeProps {
	condition?: ConditionType;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
	condition = "unknown",
}) => {
	const getConditionStyle = (cond: string) => {
		switch (cond.toLowerCase()) {
			case "good":
				return "bg-green-100 text-green-700";
			case "fair":
				return "bg-yellow-100 text-yellow-800";
			case "poor":
				return "bg-red-100 text-red-700";
			default:
				return "bg-neutral-100 text-neutral-600";
		}
	};

	return (
		<span
			className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getConditionStyle(
				condition
			)}`}>
			{condition}
		</span>
	);
};

export default ConditionBadge;
