import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { PieChart as PieIcon } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { calculateCategoryBreakdown, formatCurrency } from "@/lib/calculations";

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const COLORS = ["#10b981", "#f97316", "#8b5cf6", "#38bdf8", "#f43f5e", "#94a3b8"];

export default function CategoryChart({ transactions, currency = "INR" }: { transactions: Transaction[]; currency?: string }) {
  const data: CategoryItem[] = calculateCategoryBreakdown(transactions)
    .slice(0, 6)
    .map((item, index) => ({ ...item, color: COLORS[index] }));
  const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Spending DNA</h2>
              <p className="text-xs text-slate-500 font-medium">Where your money goes this month</p>
            </div>
          </div>

          <Link
            to="/transactions"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
          >
            <span>View Details</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {/* Donut and Legend List */}
        <div className="flex items-center gap-4 my-2">
          {/* Donut with center text */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((item) => (
                    <Cell key={item.category} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatCurrency(Number(val), currency), ""]}
                  contentStyle={{
                    backgroundColor: "#042d2f",
                    borderRadius: "10px",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                {formatCurrency(totalExpenses, currency)}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Total Expenses</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex-1 space-y-1.5 text-xs">
            {data.length === 0 ? (
              <p className="text-slate-400 text-xs">Add an expense to see your spending mix.</p>
            ) : data.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-700 truncate">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">{item.percentage}%</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
