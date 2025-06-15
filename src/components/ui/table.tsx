import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-lg border border-gray-200 shadow-sm bg-white">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm border-collapse", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 [&_tr]:border-0", 
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "divide-y divide-gray-100 [&_tr:last-child]:border-0 bg-white", 
      className
    )}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-all duration-200 ease-in-out hover:bg-blue-50/50 hover:shadow-sm data-[state=selected]:bg-blue-100 data-[state=selected]:shadow-md group",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-14 px-6 text-left align-middle font-semibold text-gray-700 uppercase tracking-wider text-xs bg-transparent [&:has([role=checkbox])]:pr-0 first:rounded-tl-lg last:rounded-tr-lg relative",
      "after:content-[''] after:absolute after:right-0 after:top-3 after:bottom-3 after:w-px after:bg-gray-300 last:after:hidden",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-6 py-4 align-middle text-gray-900 [&:has([role=checkbox])]:pr-0 relative group-hover:text-gray-800 transition-colors duration-200",
      "after:content-[''] after:absolute after:right-0 after:top-2 after:bottom-2 after:w-px after:bg-gray-100 last:after:hidden group-hover:after:bg-gray-200",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 text-sm text-gray-600 font-medium bg-gray-50 py-3 px-4 rounded-lg border border-gray-200", 
      className
    )}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Additional utility components for enhanced tables
const TableContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
TableContainer.displayName = "TableContainer"

const TableTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50",
      className
    )}
    {...props}
  >
    <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
  </div>
))
TableTitle.displayName = "TableTitle"

const TableEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-center py-12 px-6 text-gray-500",
      className
    )}
    {...props}
  >
    <div className="flex flex-col items-center space-y-3">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">No data available</p>
        <p className="text-xs text-gray-500 mt-1">{children || "There are no items to display at this time."}</p>
      </div>
    </div>
  </div>
))
TableEmpty.displayName = "TableEmpty"

// Variants for different table styles
const TableVariants = {
  default: "",
  striped: "[&_tbody_tr:nth-child(even)]:bg-gray-50/30",
  compact: "[&_th]:h-10 [&_th]:py-2 [&_td]:py-2",
  bordered: "border-2 [&_th]:border [&_td]:border border-gray-300",
  minimal: "border-0 shadow-none [&_thead]:bg-transparent [&_thead]:border-b [&_tbody_tr]:border-b-0 [&_tbody]:divide-y-0"
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableContainer,
  TableTitle,
  TableEmpty,
  TableVariants,
}