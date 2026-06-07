import { auth } from "@/auth";
import { Gear, SignOut, ShieldCheck, UserCircle, Cpu } from "@phosphor-icons/react/dist/ssr";
import { signOut } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-12 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-accent text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
            <Gear size={14} />
            Control_Panel
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">
            System.<span className="text-accent">Settings</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1px bg-white/5 border border-white/5">
        {/* Profile Info */}
        <div className="lg:col-span-4 bg-black p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full border border-accent/20 p-1 bg-accent/5">
              <img src={session?.user?.image || ""} alt="Profile" className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all" />
            </div>
            <div>
              <div className="text-lg font-mono font-bold uppercase tracking-tight">{session?.user?.name}</div>
              <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{session?.user?.email}</div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span>Auth_Status</span>
              <span className="text-accent">Verified</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span>Encryption</span>
              <span className="text-white/70">AES_256</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="lg:col-span-8 bg-black p-10">
          <div className="space-y-12">
            <div className="pt-12 border-t border-white/5">
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="w-full glass-panel py-6 rounded-sm font-mono font-bold tracking-[0.5em] uppercase hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all flex items-center justify-center gap-4"
                >
                  <SignOut size={24} weight="bold" />
                  Terminate Session
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
