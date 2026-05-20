import { Enums } from "@/integrations/supabase/types";

export const CATEGORY_LABELS: Record<Enums<"complaint_category">, string> = {
  roads_and_infrastructure: "Roads & Infrastructure",
  water_supply: "Water Supply",
  electricity: "Electricity",
  sanitation: "Sanitation",
  healthcare: "Healthcare",
  education: "Education",
  housing: "Housing",
  public_safety: "Public Safety",
  environment: "Environment",
  other: "Other",
};

export const STATUS_LABELS: Record<Enums<"complaint_status">, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  forwarded: "Forwarded",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<Enums<"complaint_status">, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  in_progress: "bg-info/15 text-info border-info/30",
  forwarded: "bg-secondary/15 text-secondary border-secondary/30",
  resolved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export const DEPARTMENTS = [
  "Public Works Department",
  "Water Resources Department",
  "Electricity Board",
  "Municipal Corporation",
  "Health Department",
  "Education Department",
  "Housing Board",
  "Police Department",
  "Environment Agency",
  "Revenue Department",
  "Transport Department",
  "Social Welfare Department",
];
