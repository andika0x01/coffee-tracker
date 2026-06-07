"use client";

import { deleteLog } from "@/lib/actions";
import { Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("Konfirmasi Penghapusan: Apakah Anda yakin ingin menghapus catatan ini secara permanen dari sistem?")) {
      await deleteLog(id);
      router.push("/list");
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDelete}
      className="w-full glass-panel py-5 rounded-sm font-mono font-bold tracking-[0.3em] uppercase border-red-500/20 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-center gap-4 group text-xs"
    >
      <Trash size={20} className="group-hover:rotate-12 transition-transform" />
      <span>Hapus Entri</span>
    </motion.button>
  );
}
