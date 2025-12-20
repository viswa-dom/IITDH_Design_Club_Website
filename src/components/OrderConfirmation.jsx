import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OrderConfirmation() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to merch page
    navigate('/merch');
  }, [navigate]);

  return null;
}