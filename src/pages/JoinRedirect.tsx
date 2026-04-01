import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * /join?ref=agentslug → stores ref in sessionStorage then redirects to /signup
 */
export default function JoinRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) sessionStorage.setItem("afristall_ref", ref);
    navigate("/signup", { replace: true });
  }, [params, navigate]);

  return null;
}
