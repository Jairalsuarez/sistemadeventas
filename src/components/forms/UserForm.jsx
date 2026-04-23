export default function UserForm({ form, isEditing = false, onChange, onSubmit, submitLabel, disableEmail = false, showPasswordField = false, submitDisabled = false }) {
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm">
        Nombre
        <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" name="nombre" onChange={onChange} value={form.nombre} />
      </label>
      <label className="grid gap-2 text-sm">
        Apellido
        <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" name="apellido" onChange={onChange} value={form.apellido} />
      </label>
      <label className="grid gap-2 text-sm">
        Correo
        <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" disabled={disableEmail} name="email" onChange={onChange} type="email" value={form.email} />
      </label>
      <label className="grid gap-2 text-sm">
        Telefono
        <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" name="telefono" onChange={onChange} value={form.telefono || ""} />
      </label>
      <label className="grid gap-2 text-sm">
        Rol
        <select className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" name="role" onChange={onChange} value={form.role}>
          <option value="vendedor">Vendedor</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      {showPasswordField ? (
        <label className="grid gap-2 text-sm">
          {isEditing ? "Nueva clave opcional" : "Clave temporal"}
          <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" name="password" onChange={onChange} type="password" value={form.password} />
        </label>
      ) : (
        <div className="grid gap-2 text-sm">
          <span>Acceso</span>
          <div className="rounded-md border border-[#dfe7db] px-3 py-2 text-[#5b6d61] dark:border-white/10 dark:bg-[#0d1710] dark:text-white/65">
            {form.role === "admin" ? "Control operativo del negocio sin gestion de usuarios" : "Solo ventas y consulta basica"}
          </div>
        </div>
      )}
      <div className="md:col-span-2">
        <button className="rounded-md bg-[#1f7a3a] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={submitDisabled} type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
