import { useNavigate, useParams } from "react-router-dom";
import StatusScreen, { CheckIcon } from "../../components/ui/StatusScreen";
import Button from "../../components/ui/Button";

export default function PaymentSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <StatusScreen
      tone="success"
      icon={<CheckIcon />}
      title="Payment successful"
      description="Your entry has been confirmed. You're all set to play."
    >
      <Button size="lg" fullWidth onClick={() => navigate(`/games/${id}/entry`)}>
        Enter game
      </Button>
    </StatusScreen>
  );
}
