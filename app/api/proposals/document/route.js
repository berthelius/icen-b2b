import { proposalHtml, buildProposal } from "@/lib/proposal";

export async function POST(request) {
  const body = await request.json();
  const proposal = body.proposal || buildProposal(body);
  const html = proposalHtml(proposal);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFileName(proposal.companyName)}-propuesta-fundae.html"`,
    },
  });
}

function safeFileName(value) {
  return String(value || "icen")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
