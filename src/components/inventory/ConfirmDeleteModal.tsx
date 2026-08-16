"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDeleteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName?: string;
    onConfirm: () => Promise<void> | void;
    loading?: boolean;
}

export function ConfirmDeleteModal({
    open,
    onOpenChange,
    itemName,
    onConfirm,
    loading = false,
}: ConfirmDeleteModalProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!loading) {
                    onOpenChange(value);
                }
            }}
        >
            <DialogContent
                className="
                    w-[calc(100%-2rem)]
                    max-w-md
                    rounded-2xl
                    p-0
                "
            >
                <DialogHeader className="px-6 pt-6">
                    <div className="flex items-start gap-4">

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-red-50
                                text-red-500
                            "
                        >
                            <AlertTriangle size={22} />
                        </div>

                        <div className="min-w-0">
                            <DialogTitle className="font-manrope text-lg font-bold text-slate-900">
                                Hapus Obat OTC?
                            </DialogTitle>

                            <DialogDescription className="mt-1 leading-relaxed text-slate-500">
                                Apakah kamu yakin ingin menghapus obat{" "}
                                <span className="font-semibold text-slate-700">
                                    {itemName || "ini"}
                                </span>
                                ?
                            </DialogDescription>
                        </div>

                    </div>
                </DialogHeader>

                <div className="px-6 py-5">
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-sm leading-relaxed text-amber-800">
                            Obat akan disembunyikan dari inventory aktif.
                            Data batch dan riwayat transaksi tetap dipertahankan
                            untuk menjaga histori inventaris.
                        </p>
                    </div>
                </div>

                <DialogFooter
                    className="
                        flex
                        flex-col-reverse
                        gap-3
                        border-t
                        border-slate-100
                        px-6
                        py-5
                        sm:flex-row
                        sm:justify-end
                    "
                >
                    <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>

                    <Button
                        type="button"
                        disabled={loading}
                        onClick={handleConfirm}
                        className="
                            w-full
                            bg-red-500
                            text-white
                            hover:bg-red-600
                            sm:w-auto
                        "
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={16}
                                    className="mr-2 animate-spin"
                                />
                                Menghapus...
                            </>
                        ) : (
                            <>
                                <Trash2
                                    size={16}
                                    className="mr-2"
                                />
                                Hapus Obat
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}