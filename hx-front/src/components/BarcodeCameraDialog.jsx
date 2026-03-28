import { useEffect, useId, useRef } from "react";
import { toast } from "sonner";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

async function disposeHtml5Qrcode(scanner) {
  if (!scanner) return;
  try {
    if (scanner.isScanning) {
      await scanner.stop();
    }
  } catch {
    /* 未成功 start 时 stop 会报错，忽略即可 */
  }
  try {
    scanner.clear();
  } catch {
    /* ignore */
  }
}

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.QR_CODE,
];

/**
 * 使用手机 / 平板摄像头识别条码或二维码，识别成功后写入 onDecoded 并关闭。
 */
export function BarcodeCameraDialog({ open, onOpenChange, onDecoded }) {
  const reactId = useId();
  const regionId = `barcode-cam-${reactId.replace(/:/g, "")}`;
  const instanceRef = useRef(null);
  const onDecodedRef = useRef(onDecoded);
  onDecodedRef.current = onDecoded;

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const el = document.getElementById(regionId);
      if (!el || cancelled) return;

      const html5QrCode = new Html5Qrcode(regionId, {
        verbose: false,
        formatsToSupport: BARCODE_FORMATS,
      });
      instanceRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.777778,
          },
          (decodedText) => {
            if (cancelled) return;
            const t = String(decodedText || "").trim().slice(0, 64);
            if (!t) return;
            onDecodedRef.current(t);
            instanceRef.current = null;
            void disposeHtml5Qrcode(html5QrCode);
            onOpenChange(false);
          },
          () => {}
        )
        .catch((err) => {
          console.warn(err);
          instanceRef.current = null;
          void disposeHtml5Qrcode(html5QrCode);
          if (!cancelled) {
            toast.error(
              "无法打开摄像头。请检查浏览器权限；若仍失败，可改用手动输入条码。"
            );
            onOpenChange(false);
          }
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      const q = instanceRef.current;
      instanceRef.current = null;
      void disposeHtml5Qrcode(q);
    };
  }, [open, onOpenChange, regionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>相机扫码</DialogTitle>
          <DialogDescription>
            将条码或二维码对准画面中央，保持稳定与光线充足。识别成功后会自动填入并关闭。
            摄像头需在安全环境（HTTPS 或本机 localhost）下才能使用。
          </DialogDescription>
        </DialogHeader>
        <div
          id={regionId}
          className="min-h-[200px] w-full overflow-hidden rounded-lg bg-black/5"
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
