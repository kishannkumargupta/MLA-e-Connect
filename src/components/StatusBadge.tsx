import { Badge } from "@/components/ui/badge";
import { Enums } from "@/integrations/supabase/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: Enums<"complaint_status">;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge variant="outline" className={`${STATUS_COLORS[status]} font-medium text-xs border`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
};

export default StatusBadge;
