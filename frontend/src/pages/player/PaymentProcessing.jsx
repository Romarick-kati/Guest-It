import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StatusScreen, { Spinner } from "../../components/ui/StatusScreen";
import { processPayment } from "../../lib/api";

export default function PaymentProcessing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "";

  useEffect(() => {
    let cancelled = false;
    processPayment({ phoneNumber: phone })
      .then(() => {
        if (!cancelled) navigate(`/games/${id}/payment/success`, { replace: true });
      })
      .catch(() => {
        if (!cancelled) navigate(`/games/${id}/payment/failed`, { replace: true });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StatusScreen
      icon={<Spinner />}
      title="Processing payment..."
      description="Please wait while we confirm your payment. This can take a few seconds."
    />
  );
}
