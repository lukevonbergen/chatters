import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Consistent color scheme for all reports
export const reportColors = {
  primary: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-900",
    muted: "text-slate-600",
    accent: "text-slate-900"
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200", 
    text: "text-green-900",
    accent: "text-custom-green",
    icon: "text-custom-green"
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-900", 
    accent: "text-custom-yellow",
    icon: "text-custom-yellow"
  },
  danger: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    accent: "text-custom-red", 
    icon: "text-custom-red"
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    accent: "text-custom-blue",
    icon: "text-custom-blue"
  },
  neutral: {
    bg: "bg-gray-50", 
    border: "border-gray-200",
    text: "text-gray-900",
    accent: "text-gray-600",
    icon: "text-gray-600"
  }
};

const MetricCard = React.forwardRef(({ 
  className,
  title,
  description, 
  value,
  metric,
  trend,
  variant = "primary",
  icon: Icon,
  loading = false,
  ...props 
}, ref) => {
  const colors = reportColors[variant] || reportColors.primary;
  
  if (loading) {
    return (
      <Card ref={ref} className={className} {...props}>
        <CardContent className="">
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              {Icon && <div className="h-5 w-5 bg-gray-200 rounded"></div>}
            </div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={ref} className={className} {...props}>
      <CardContent className="">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {Icon && (
            <Icon className={cn("h-5 w-5", colors.icon)} />
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            {value}
            {metric && <span className="text-sm font-normal text-gray-500 ml-1">{metric}</span>}
          </div>
          
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
          
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend.direction === "up" && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  trend.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  <TrendingUp className="w-3 h-3" />
                  {trend.value && <span>{trend.value}</span>}
                </div>
              )}
              {trend.direction === "down" && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  trend.positive ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                )}>
                  <TrendingDown className="w-3 h-3" />
                  {trend.value && <span>{trend.value}</span>}
                </div>
              )}
              {trend.direction === "neutral" && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <Minus className="w-3 h-3" />
                  {trend.value && <span>{trend.value}</span>}
                </div>
              )}
              {trend.text && (
                <span className="text-xs text-gray-500">
                  {trend.text}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
MetricCard.displayName = "MetricCard";

export { MetricCard };