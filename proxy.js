export function proxy(request) {
  const user = process.env.ICEN_B2B_BASIC_USER;
  const password = process.env.ICEN_B2B_BASIC_PASSWORD;

  if (!user || !password) return;

  const auth = request.headers.get("authorization") || "";
  const [scheme, encoded] = auth.split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const decoded = atob(encoded);
      const separator = decoded.indexOf(":");
      const providedUser = decoded.slice(0, separator);
      const providedPassword = decoded.slice(separator + 1);
      if (providedUser === user && providedPassword === password) return;
    } catch (_) {}
  }

  return new Response("Autenticacion requerida", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ICEN B2B"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
