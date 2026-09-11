import { useNavigate, useParams } from "react-router-dom";
import StatusScreen, { XIcon } from "../../components/ui/StatusScreen";
import Button from "../../components/ui/Button";

export default function PaymentFailed() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <StatusScreen
      tone="danger"
      icon={<XIcon />}
      title="Payment failed"
      description="We couldn't confirm your payment. No entry fee was charged."
    >
      <Button size="lg" fullWidth onClick={() => navigate(`/games/${id}/checkout`)}>
        Try again
      </Button>
      <Button variant="outline" fullWidth onClick={() => navigate(`/games/${id}`)}>
        Back to game
      </Button>
    </StatusScreen>
  );
}
