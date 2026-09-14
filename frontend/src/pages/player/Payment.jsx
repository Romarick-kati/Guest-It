import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingState from "../../components/ui/LoadingState";
import { getSession, isSignedIn } from "../../lib/auth";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn()) {
      navigate("/signup", { replace: true, state: { returnTo: `/games/${id}/payment` } });
      return;
    }

    const username = getSession()?.user?.username || "";
    navigate(`/games/${id}/checkout`, { replace: true, state: { username } });
  }, [id, navigate]);

  return <LoadingState fullPage label="Preparing donation..." />;
}
