import { cookies } from "next/headers";
import Sidebar from "./_components/Sidebar";
import TopBar from "./_components/TopBar";

export const metadata = { title: "Kelikuli Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[200] flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
