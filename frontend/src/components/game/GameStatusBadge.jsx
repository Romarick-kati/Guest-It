import Badge from "../ui/Badge";
import { getGameStatusMeta, GAME_STATUS } from "../../lib/gameStatus";

export default function GameStatusBadge({ status, className = "" }) {
  const { label, tone } = getGameStatusMeta(status);
  return (
    <Badge tone={tone} dot={status === GAME_STATUS.LIVE} className={className}>
      {label}
    </Badge>
  );
}
