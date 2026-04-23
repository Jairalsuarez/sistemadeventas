import Modal from "../Modal";

export default function HelpModal({ description, onClose, open, title }) {
  return (
    <Modal open={open} onClose={onClose} text="Ayuda rapida" title={title}>
      <div className="grid gap-4">
        <p className="text-base leading-7 text-[#142026]/72 dark:text-white/72">{description}</p>
        <button
          className="cursor-pointer min-h-12 rounded-2xl bg-[#3B657A] px-5 text-sm font-bold text-white transition hover:bg-[#123142]"
          onClick={onClose}
          type="button"
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
}
