import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, created_at')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useAddDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name) => {
      const { data, error } = await supabase
        .from('departments')
        .insert({ name: name.trim() })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, oldName, newName }) => {
      const { error: deptError } = await supabase
        .from('departments')
        .update({ name: newName.trim() })
        .eq('id', id)
      if (deptError) throw deptError
      // Rename department in all employees that reference the old name
      const { error: empError } = await supabase
        .from('employees')
        .update({ department: newName.trim() })
        .eq('department', oldName)
      if (empError) throw empError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}
