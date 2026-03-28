/**
 * 条形码录入说明：兼顾无硬件的个人用户与使用扫码枪的组织。
 */
export function BarcodeFieldHelp() {
  return (
    <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
      <p>
        没有 USB 扫码枪时，可直接在输入框里
        <span className="text-foreground/90"> 手动输入或粘贴 </span>
        条码数字；在手机上可点旁边的「相机扫码」，用摄像头识别常见商品码（需允许浏览器使用摄像头）。
      </p>
      <p>
        使用 USB 扫码枪时，多数设备会
        <span className="text-foreground/90"> 模拟键盘输入 </span>
        ：请先用光标点击输入框，再扫描，内容会自动写入。
      </p>
      <p className="text-muted-foreground/85">
        支持 EAN-13、UPC、CODE-128 等常见格式，最多 64 位。正式对外部署时请使用 HTTPS，否则部分浏览器可能禁止调用摄像头。
      </p>
    </div>
  );
}
