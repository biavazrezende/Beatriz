import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEmployees, useAddEmployee, useUpdateEmployee, uploadPhoto } from '../../hooks/useEmployees'
import { useDepartments } from '../../hooks/useDepartments'
import { ArrowLeft, Upload, X, ImagePlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'hiring', label: 'Em contratação' },
]

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_RAW_SIZE = 20 * 1024 * 1024 // 20 MB hard cap before compression

// Compress image to max 1200px wide / tall at 85% JPEG quality
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_DIM = 1200
      const ratio = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg',
        0.85,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Falha ao carregar imagem')) }
    img.src = url
  })
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-vermelho ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && (
        <p className="text-xs text-vermelho mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
}

function PhotoUpload({ preview, onFile, onRemove, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function processFile(file) {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onFile(null, 'Formato inválido. Use JPG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_RAW_SIZE) {
      onFile(null, 'Arquivo muito grande. Máximo 20 MB.')
      return
    }
    onFile(file, null)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }, [])

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragging(true) }, [])
  const handleDragLeave = useCallback(() => setDragging(false), [])

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Foto</label>

      {preview ? (
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={preview}
              alt="Foto do colaborador"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-apatita/30 shadow-sm"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-vermelho text-white flex items-center justify-center shadow-md hover:bg-vermelho/90 transition-colors"
              title="Remover foto"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm font-medium text-apatita hover:text-apatita/80 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Trocar foto
            </button>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG ou WebP · até 20 MB</p>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2
            cursor-pointer transition-all text-center
            ${dragging
              ? 'border-apatita bg-apatita/5 scale-[1.01]'
              : error
                ? 'border-vermelho/50 bg-red-50/50'
                : 'border-gray-200 hover:border-apatita/50 hover:bg-gray-50/60'}
          `}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragging ? 'bg-apatita/20' : 'bg-gray-100'}`}>
            <ImagePlus className={`w-6 h-6 ${dragging ? 'text-apatita' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {dragging ? 'Solte a imagem aqui' : 'Arraste uma foto ou clique para selecionar'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG ou WebP · até 20 MB (comprimido automaticamente)</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-vermelho flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />
    </div>
  )
}

export default function EmployeeForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { data: employees = [] } = useEmployees()
  const { data: departments = [] } = useDepartments()
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
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [compressing, setCompressing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name ?? '',
        role: employee.role ?? '',
        department: employee.department ?? '',
        manager_id: employee.manager_id ?? '',
        email: employee.email ?? '',
        status: employee.status ?? 'active',
      })
      setPhotoPreview(employee.photo_url ?? '')
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

  function handlePhotoFile(file, err) {
    setPhotoError(err ?? '')
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handlePhotoRemove() {
    setPhotoFile(null)
    setPhotoPreview('')
    setPhotoError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // Clear stale photo error if user isn't uploading a file
    if (!photoFile) setPhotoError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (photoError) return

    setSaving(true)
    try {
      let photoUrl = isEdit ? (employee?.photo_url ?? null) : null

      if (isEdit) {
        if (photoFile) {
          setCompressing(true)
          const compressed = await compressImage(photoFile)
          setCompressing(false)
          photoUrl = await uploadPhoto(id, compressed)
        } else if (!photoPreview) {
          photoUrl = null
        }

        await updateEmployee.mutateAsync({
          id,
          ...form,
          photo_url: photoUrl,
          manager_id: form.manager_id || null,
          email: form.email || null,
        })
      } else {
        const newId = crypto.randomUUID()
        if (photoFile) {
          setCompressing(true)
          const compressed = await compressImage(photoFile)
          setCompressing(false)
          photoUrl = await uploadPhoto(newId, compressed)
        }

        await addEmployee.mutateAsync({
          id: newId,
          ...form,
          photo_url: photoUrl,
          manager_id: form.manager_id || null,
          email: form.email || null,
        })
      }

      setSaved(true)
      setTimeout(() => navigate('/admin/employees'), 800)
    } catch (err) {
      setCompressing(false)
      setErrors({ _global: err.message || 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  const managers = employees.filter((e) => e.id !== id)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-azul-escuro">
            {isEdit ? 'Editar colaborador' : 'Novo colaborador'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEdit ? `Editando: ${employee?.name ?? '...'}` : 'Preencha os dados do novo integrante'}
          </p>
        </div>
      </div>

      {/* Global error */}
      {errors._global && (
        <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-vermelho text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {errors._global}
        </div>
      )}

      {/* Success banner */}
      {saved && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Salvo com sucesso! Redirecionando…
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <PhotoUpload
            preview={photoPreview}
            onFile={handlePhotoFile}
            onRemove={handlePhotoRemove}
            error={photoError}
          />
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-azul-escuro border-b border-gray-100 pb-3">Dados do colaborador</h3>

          <Field label="Nome completo" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Ana Almeida"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 transition-colors ${errors.name ? 'border-vermelho bg-red-50' : 'border-gray-200 focus:border-apatita'}`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cargo" required error={errors.role}>
              <input
                type="text"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="Ex: Analista de RH"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 transition-colors ${errors.role ? 'border-vermelho bg-red-50' : 'border-gray-200 focus:border-apatita'}`}
              />
            </Field>

            <Field label="Departamento" required error={errors.department}>
              <select
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 transition-colors bg-white ${errors.department ? 'border-vermelho bg-red-50' : 'border-gray-200 focus:border-apatita'}`}
              >
                <option value="">— Selecione —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="E-mail">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="colaborador@amorsaude.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 focus:border-apatita transition-colors"
            />
          </Field>
        </div>

        {/* Hierarchy & status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-azul-escuro border-b border-gray-100 pb-3">Hierarquia e status</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Gestor direto" hint="Deixe vazio para posicionar como raiz">
              <select
                value={form.manager_id}
                onChange={(e) => set('manager_id', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 focus:border-apatita transition-colors bg-white"
              >
                <option value="">— Sem gestor (raiz) —</option>
                {managers
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} · {e.role}
                    </option>
                  ))}
              </select>
            </Field>

            <Field label="Status">
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-all
                      ${form.status === opt.value
                        ? 'border-apatita bg-apatita/10 text-apatita font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'}
                    `}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={form.status === opt.value}
                      onChange={() => set('status', opt.value)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || saved}
            className="flex-1 px-4 py-3 bg-apatita text-white rounded-xl text-sm font-semibold hover:bg-apatita/90 active:scale-[0.98] disabled:opacity-60 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {compressing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Comprimindo imagem…</>
            ) : saving ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando…</>
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
            ) : (
              isEdit ? 'Salvar alterações' : 'Adicionar colaborador'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
