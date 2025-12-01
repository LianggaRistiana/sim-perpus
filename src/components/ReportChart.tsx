import React from 'react';

interface ReportChartProps {
    title: string;
    data: { label: string; value: number }[];
    type?: 'bar' | 'list';
    color?: string;
}

const ReportChart: React.FC<ReportChartProps> = ({ title, data, type = 'bar', color = 'bg-blue-500' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-neutral-900">{title}</h3>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-neutral-700">{item.label}</span>
                            <span className="text-neutral-500">{item.value}</span>
                        </div>
                        {type === 'bar' && (
                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                <div
                                    className={`h-full rounded-full ${color}`}
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportChart;
