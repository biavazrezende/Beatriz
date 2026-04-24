import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, role, department, manager_id, photo_url, email, status')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useAddEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (employee) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    // Expects { id, managerId } — reassigns direct reports before deleting
    mutationFn: async ({ id, managerId }) => {
      // Reassign direct reports to the deleted employee's own manager (or null)
      const { error: reassignError } = await supabase
        .from('employees')
        .update({ manager_id: managerId ?? null })
        .eq('manager_id', id)
      if (reassignError) throw reassignError

      const { error } = await supabase.from('employees').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useAuditLog() {
  return useQuery({
    queryKey: ['audit_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data
    },
  })
}

export function useEmployeeAuditLog(employeeId) {
  return useQuery({
    queryKey: ['audit_log', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: Boolean(employeeId),
  })
}

export async function uploadPhoto(employeeId, file) {
  const ext = file.name.split('.').pop()
  const path = `${employeeId}.${ext}`
  const { error } = await supabase.storage
    .from('employee-photos')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('employee-photos')
    .getPublicUrl(path)
  return publicUrl
}
