export type ToolStatus = "available" | "coming-soon";

export type ToolIconName = "Upload" | "Calculator" | "DollarSign";

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  route: string;
  iconName: ToolIconName;
  status: ToolStatus;
}

export const tools: ToolConfig[] = [
  {
    id: "fast-formula-upload",
    name: "Fast Formula Bulk Upload",
    description:
      "Upload and validate Oracle Fast Formula files in bulk. Supports .fff file parsing, error checking, and batch submission.",
    route: "/dashboard/tools/fast-formula-upload",
    iconName: "Upload",
    status: "available",
  },
  {
    id: "balance-definition-generator",
    name: "Payroll Balance Definition Generator",
    description:
      "Generate balance definitions for Oracle HCM Payroll. Configure feeds, dimensions, and initial values from a guided interface.",
    route: "/dashboard/tools/balance-definition-generator",
    iconName: "Calculator",
    status: "available",
  },
  {
    id: "costing-load-generator",
    name: "Costing Load Generator",
    description:
      "Generate costing setup loader files for Oracle HCM. Map cost allocation segments and produce ready-to-load HDL files.",
    route: "/dashboard/tools/costing-load-generator",
    iconName: "DollarSign",
    status: "coming-soon",
  },
];
