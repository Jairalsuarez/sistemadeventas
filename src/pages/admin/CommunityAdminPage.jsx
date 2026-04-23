import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SectionBlock from "../../components/ui/SectionBlock";

const COMMENTS_PER_PAGE = 6;

function formatCommentDate(value) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function cardTone(index) {
  const tones = [
    "border-[#d9efde] bg-white",
    "border-[#fde8d9] bg-white",
    "border-[#e3e8ff] bg-white",
  ];
  return tones[index % tones.length];
}

export default function CommunityAdminPage({ feedbacks, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(feedbacks.length / COMMENTS_PER_PAGE));
  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * COMMENTS_PER_PAGE;
    return feedbacks.slice(start, start + COMMENTS_PER_PAGE);
  }, [currentPage, feedbacks]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Comentarios de la comunidad"
        description="Revisa las opiniones publicadas en la tienda y elimina las que no quieras mostrar."
      />

      <SectionBlock
        title="Buzon publico"
        description="Estos comentarios se muestran en la portada y en la pagina de comunidad."
      >
        {feedbacks.length ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedFeedbacks.map((item, index) => (
                <article
                  key={item.id}
                  className={`rounded-2xl border p-5 shadow-[0_16px_32px_rgba(24,51,37,0.05)] ${cardTone(index)} dark:border-white/10 dark:bg-[#122117]`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e1ece3] bg-white text-[#1f7a3a] dark:bg-white/10">
                        <Icon name="chat" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">
                          Comentario {String((currentPage - 1) * COMMENTS_PER_PAGE + index + 1).padStart(2, "0")}
                        </p>
                        <p className="text-xs text-[#6a7b70] dark:text-white/50">{formatCommentDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-[#f3b2ab] bg-white px-3 py-2 text-sm font-medium text-[#b42318] transition hover:bg-[#fff3f1] dark:border-[#5e2320] dark:bg-[#122117] dark:text-[#ffb4ab]"
                      onClick={() => onDelete(item.id)}
                      type="button"
                    >
                      <Icon name="delete" />
                      Eliminar
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#5b6d61] dark:text-white/68">{item.comment}</p>
                </article>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              itemLabel="comentarios"
              onPageChange={setCurrentPage}
              pageSize={COMMENTS_PER_PAGE}
              totalItems={feedbacks.length}
              totalPages={totalPages}
            />
          </div>
        ) : (
          <EmptyState
            title="Sin comentarios"
            description="Cuando alguien deje una opinion desde la tienda publica, aparecera aqui para que la administres."
          />
        )}
      </SectionBlock>
    </div>
  );
}
