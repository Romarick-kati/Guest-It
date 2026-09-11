import Button from "../ui/Button";

export default function SubmitAnswerButton({ status = "idle", onClick, disabled, className = "" }) {
  const map = {
    idle: { label: "Submit guess", variant: "primary", loading: false },
    submitting: { label: "Submitting...", variant: "primary", loading: true },
    submitted: { label: "Submitted ✓", variant: "secondary", loading: false },
    error: { label: "Try again", variant: "danger", loading: false },
  };
  const { label, variant, loading } = map[status] || map.idle;

  return (
    <Button
      type="submit"
      variant={variant}
      size="lg"
      fullWidth
      loading={loading}
      disabled={disabled || status === "submitted"}
      onClick={onClick}
      className={className}
    >
      {label}
    </Button>
  );
}
