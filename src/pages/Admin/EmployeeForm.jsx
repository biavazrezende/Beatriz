import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEmployees, useAddEmployee, useUpdateEmployee, uploadPhoto } from '../../hooks/useEmployees'
import { ArrowLeft, Upload, User } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'hiring', label: 'Em contratação' },
]

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-vermelho mt-1">{error}</p>}
    </div>
  )
}

export default function EmployeeForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { data: employees = [] } = useEmployees()
  const addEmployee = useAddEmployee()
  const updateEmployee = useUpdateEmployee()

  const employee = isEdit ? employees.find((e) => e.id === id) : null

  const [form, setForm] = useState({
    name: '',
    role: '',
    department: '',
    manager_id: '',
    email: '',
    status: 'active',
    photo_url: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || '',
        role: employee.role || '',
        department: employee.department || '',
        manager_id: employee.manager_id || '',
        email: employee.email || '',
        status: employee.status || 'active',
        photo_url: employee.photo_url || '',
      })
      setPhotoPreview(employee.photo_url || '')
    }
  }, [employee])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    if (!form.role.trim()) errs.role = 'Cargo obrigatório'
    if (!form.department.trim()) errs.department = 'Departamento obrigatório'
    return errs
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      let photoUrl = form.photo_url
      if (photoFile) {
        const tempId = isEdit ? id : crypto.randomUUID()
        photoUrl = await uploadPhoto(tempId, photoFile)
      }

      const payload = {
        ...form,
        photo_url: photoUrl || null,
        manager_id: form.manager_id || null,
        email: form.email || null,
      }

      if (isEdit) {
        await updateEmployee.mutateAsync({ id, ...payload })
      } else {
        await addEmployee.mutateAsync(payload)
      }
      navigate('/admin/employees')
    } catch (err) {
      setErrors({ _global: err.message || 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  const managers = employees.filter((e) => e.id !== id)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-azul-escuro">
            {isEdit ? 'Editar colaborador' : 'Novo colaborador'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEdit ? `Editando: ${employee?.name}` : 'Preencha os dados abaixo'}
          </p>
        </div>
      </div>

      {errors._global && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-vermelho text-sm">
          {errors._global}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Photo upload */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
            {photoPreview ? (
              <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <label className="cursor-pointer flex items-center gap-2 text-sm font-medium text-apatita hover:text-apatita/80 transition-colors">
              <Upload className="w-4 h-4" />
              {photoPreview ? 'Trocar foto' : 'Adicionar foto'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP. Máx. 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Nome completo *" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex: Ana Almeida"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 transition-colors ${errors.name ? 'border-vermelho' : 'border-gray-200 focus:border-apatita'}`}
              />
            </Field>
          </div>

          <Field label="Cargo *" error={errors.role}>
            <input
              type="text"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              placeholder="Ex: Analista de RH"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 transition-colors ${errors.role ? 'border-vermelho' : 'border-gray-200 focus:border-apatita'}`}
            />
          </Field>

          <Field label="Departamento *" error={errors.department}>
            <input
              type="text"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
              placeholder="Ex: Pessoas e Cultura"
              list="departments-list"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 transition-colors ${errors.department ? 'border-vermelho' : 'border-gray-200 focus:border-apatita'}`}
            />
            <datalist id="departments-list">
              {[...new Set(employees.map((e) => e.department))].map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>

          <Field label="Gestor direto">
            <select
              value={form.manager_id}
              onChange={(e) => set('manager_id', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 focus:border-apatita transition-colors bg-white"
            >
              <option value="">— Sem gestor (raiz) —</option>
              {managers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.role}
                </option>
              ))}
            </select>
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="colaborador@amorsaude.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 focus:border-apatita transition-colors"
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 focus:border-apatita transition-colors bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-apatita text-white rounded-lg text-sm font-medium hover:bg-apatita/90 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Adicionar colaborador'}
          </button>
        </div>
      </form>
    </div>
  )
}
