// 这是一个模拟的 supabase 客户端，用于演示目的
// 在实际项目中，您应该使用真实的 supabase 客户端

export const supabase = {
  auth: {
    signIn: async (email: string, password: string) => {
      // 模拟登录
      return { data: { user: { id: '1', email, name: 'Test User' } }, error: null };
    },
    signUp: async (email: string, password: string) => {
      // 模拟注册
      return { data: { user: { id: '1', email, name: 'Test User' } }, error: null };
    },
    signOut: async () => {
      // 模拟登出
      return { error: null };
    },
    getCurrentUser: async () => {
      // 模拟获取当前用户
      return { data: { user: { id: '1', email: 'test@example.com', name: 'Test User' } }, error: null };
    }
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        data: [],
        error: null
      })
    }),
    insert: () => ({
      data: null,
      error: null
    }),
    update: () => ({
      eq: () => ({
        data: null,
        error: null
      })
    }),
    delete: () => ({
      eq: () => ({
        data: null,
        error: null
      })
    })
  })
};