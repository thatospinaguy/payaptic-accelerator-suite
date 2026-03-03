export const tools = [
  {
    name: "Fast Formula Bulk Upload",
    slug: "fast-formula-upload",
    description:
      "Automate the creation of Oracle HCM Fast Formula bulk upload zip files. Upload your formula code files and Oracle report, and generate the correctly structured import package.",
    icon: "FileUp" as const,
    status: "active" as const,
    category: "Payroll",
    route: "/dashboard/tools/fast-formula-upload",
  },
  {
    name: "Payroll Balance Definition Generator",
    slug: "balance-definition-generator",
    description:
      "Generate Oracle HCM HDL BalanceFeed .dat files for payroll balance definitions. Replace manual Excel-to-Notepad workflows with a guided, error-checked process.",
    icon: "Scale" as const,
    status: "active" as const,
    category: "Payroll",
    route: "/dashboard/tools/balance-definition-generator",
  },
  {
    name: "Element Group Loader",
    slug: "element-group-loader",
    description:
      "Generate HDL files to assign payroll elements to element groups in Oracle HCM.",
    icon: "FolderTree" as const,
    status: "active" as const,
    category: "Payroll",
    route: "/dashboard/tools/element-group-loader",
  },
  {
    name: "Calculation Value Definition Loader",
    slug: "calc-value-def-loader",
    description:
      "Generate dual-structure HDL files for Oracle HCM Calculation Value Definitions with automatic ValueDefinition and RangeItem pairing.",
    icon: "Calculator" as const,
    status: "active" as const,
    category: "Payroll",
    route: "/dashboard/tools/calc-value-def-loader",
  },
  {
    name: "Costing Load Generator",
    slug: "costing-load-generator",
    description:
      "Generate Oracle HCM costing allocation data loads. Configure cost centers, account segments, and distribution rules.",
    icon: "Calculator" as const,
    status: "coming-soon" as const,
    category: "Payroll",
    route: "/dashboard/tools/costing-load-generator",
  },
];

export type Tool = (typeof tools)[number];
