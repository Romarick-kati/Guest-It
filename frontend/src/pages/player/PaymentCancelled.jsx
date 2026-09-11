import { useNavigate, useParams } from "react-router-dom";
import StatusScreen, { XIcon } from "../../components/ui/StatusScreen";
import Button from "../../components/ui/Button";

export default function PaymentCancelled() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <StatusScreen
      tone="warning"
      icon={<XIcon />}
      title="Payment cancelled"
      description="Your game entry was not completed. You can try again anytime before the game closes."
    >
      <Button size="lg" fullWidth onClick={() => navigate(`/games/${id}`)}>
        Return to game
      </Button>
    </StatusScreen>
  );
}
