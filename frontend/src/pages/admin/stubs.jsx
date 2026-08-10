// 6-qadamda to'liq quriladi
const Coming = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="text-4xl mb-3">🚧</div>
      <h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>
      <p className="text-sm text-[var(--text-muted)] mt-1">6-qadamda quriladi</p>
    </div>
  </div>
)

export const ArticlesAdminPage = () => <Coming title="Maqolalar boshqaruvi" />
export const ArticleFormPage   = () => <Coming title="Maqola yozish" />
export const CategoriesPage    = () => <Coming title="Kategoriyalar" />
export const UsersPage         = () => <Coming title="Foydalanuvchilar" />
export const CommentsPage      = () => <Coming title="Izohlar" />
