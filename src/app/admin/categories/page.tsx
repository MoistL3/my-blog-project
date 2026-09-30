import { requireAdmin } from "@/lib/admin";
import { getCategories } from "@/lib/data";
import { deleteCategory, saveCategory } from "@/app/actions";

function CategoryFields({ category }: { category?: Awaited<ReturnType<typeof getCategories>>[number] }) {
  return <form action={saveCategory} className="category-edit-form"><input type="hidden" name="id" value={category?.id ?? ""} /><label>Category name<input name="name" defaultValue={category?.name} required /></label><label>Slug<input name="slug" defaultValue={category?.slug} /></label><label>Order<input name="order" type="number" defaultValue={category?.order ?? 0} /></label><label>Description<input name="description" defaultValue={category?.description ?? ""} /></label><button className="admin-button" type="submit">{category ? "save" : "add category"}</button></form>;
}

export default async function CategoriesManager({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdmin(); const [categories, params] = await Promise.all([getCategories(), searchParams]);
  return <div className="admin-page"><div className="admin-page-heading"><div><p className="eyebrow">organization</p><h1>Categories</h1><p>Group writing into clear paths for your readers.</p></div></div>{params.error && <p className="admin-alert">{params.error}</p>}{params.saved && <p className="admin-success">Category changes saved.</p>}<section className="admin-panel"><div className="admin-panel-heading"><h2>Add category</h2></div><CategoryFields /></section><section className="admin-panel admin-list-panel"><div className="admin-panel-heading"><h2>Category order <span className="count-badge">{categories.length}</span></h2><span>LOWER ORDER APPEARS FIRST</span></div>{categories.map((category) => <div className="managed-category" key={category.id}><CategoryFields category={category} /><form action={deleteCategory} className="delete-form"><input type="hidden" name="id" value={category.id} /><button type="submit">delete</button></form></div>)}</section></div>;
}