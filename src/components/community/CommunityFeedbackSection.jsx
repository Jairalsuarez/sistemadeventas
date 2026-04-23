import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../ui/Icon";

function formatCommentDate(value) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(value));
}

function quoteTone(index) {
  const styles = [
    "border-[#cce9d3] bg-[#f6fbf7]",
    "border-[#fde6d3] bg-[#fffaf5]",
    "border-[#e7ebfb] bg-[#f8f9ff]",
  ];
  return styles[index % styles.length];
}

export default function CommunityFeedbackSection({ feedbacks, feedbackSubmitting, onSubmit }) {
  const [form, setForm] = useState({ comment: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onSubmit(form);
    if (result?.ok) {
      setForm({ comment: "" });
    }
  };

  return (
    <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="rounded-[32px] border border-[#dbe8dd] bg-white/92 p-6 shadow-[0_24px_55px_rgba(24,51,37,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">Comunidad</span>
            <h2 className="mt-2 text-2xl font-semibold">Lo que dice la gente</h2>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7db] bg-white px-4 py-2.5 text-sm font-medium" to="/comunidad">
            <Icon name="forum" />
            Ver todos
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {feedbacks.slice(0, 3).map((item, index) => (
            <article key={item.id} className={`rounded-[24px] border p-4 shadow-[0_12px_24px_rgba(24,51,37,0.04)] ${quoteTone(index)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#1f7a3a]">
                    <Icon name="chat_bubble" />
                  </span>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6c7c72]">Comentario {String(index + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#5b6d61]">{item.comment}</p>
              <p className="mt-4 text-xs font-medium text-[#6a7b70]">{formatCommentDate(item.createdAt)}</p>
            </article>
          ))}
        </div>
      </div>

      <form className="rounded-[32px] border border-[#dbe8dd] bg-white/92 p-6 shadow-[0_24px_55px_rgba(24,51,37,0.06)]" onSubmit={handleSubmit}>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">Feedback anonimo</span>
        <h2 className="mt-2 text-2xl font-semibold">Deja tu comentario</h2>
        <p className="mt-2 text-sm leading-7 text-[#5b6d61]">Tu comentario se publica en la pagina de comunidad sin necesidad de iniciar sesion.</p>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm">
            Comentario
            <textarea
              className="min-h-[140px] rounded-[24px] border border-[#dfe7db] bg-[#fbfcfa] px-4 py-4"
              onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
              placeholder="Comparte tu experiencia con el producto, la atencion o el pedido."
              value={form.comment}
            />
          </label>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white disabled:opacity-60" disabled={feedbackSubmitting || !form.comment.trim()} type="submit">
            <Icon name="send" />
            {feedbackSubmitting ? "Enviando..." : "Publicar comentario"}
          </button>
        </div>
      </form>
    </section>
  );
}
