"use client";

import { Plus } from "@phosphor-icons/react";
import { toast } from "react-hot-toast";

export default function SubmitButton() {
  return (
    <button
      type="submit"
      onClick={() => {
        toast.success("Catatan berhasil disimpan!");
      }}
      className="w-full glass-panel py-10 rounded-sm font-mono font-bold tracking-[0.5em] uppercase hover:bg-accent hover:text-black transition-all group relative overflow-hidden"
    >
      <span className="relative z-10 flex items-center justify-center gap-4">
        Simpan
        <Plus size={24} weight="bold" className="group-hover:rotate-90 transition-transform" />
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </button>
  );
}
