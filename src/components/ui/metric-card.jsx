import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";

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
    bg: "bg-emerald-50",
    border: "border-emerald-200", 
    text: "text-emerald-900",
    accent: "text-emerald-600",
    icon: "text-emerald-600"
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900", 
    accent: "text-amber-600",
    icon: "text-amber-600"
  },
  danger: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    accent: "text-red-600", 
    icon: "text-red-600"
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    accent: "text-blue-600",
    icon: "text-blue-600"
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
            <div className={cn(
              "text-xs font-medium",
              trend.direction === "up" && trend.positive ? colors.accent : 
              trend.direction === "down" && !trend.positive ? colors.accent :
              "text-gray-500"
            )}>
              {trend.text}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
MetricCard.displayName = "MetricCard";

export { MetricCard };