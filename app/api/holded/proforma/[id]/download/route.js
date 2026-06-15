import { getHoldedProformaPdf } from "@/lib/holded";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const pdf = await getHoldedProformaPdf(id);
    if (!pdf.ok) {
      return Response.json(pdf, { status: 404 });
    }
    return new Response(pdf.body, {
      status: 200,
      headers: {
        "Content-Type": pdf.contentType,
        "Content-Disposition": `attachment; filename="holded-proforma-${id}.pdf"`,
      },
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
