const LOGO_SRC = "/logo - Copy.png";

let logoDataUrlPromise;

export function getInvoiceLogoDataUrl() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve({ dataUrl: "", width: 0, height: 0 });
  }

  if (!logoDataUrlPromise) {
    logoDataUrlPromise = new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = "anonymous";

      image.onload = () => {
        try {
          const source = document.createElement("canvas");
          source.width = image.naturalWidth;
          source.height = image.naturalHeight;

          const sourceContext = source.getContext("2d", { willReadFrequently: true });
          sourceContext.drawImage(image, 0, 0);

          const { data, width, height } = sourceContext.getImageData(0, 0, source.width, source.height);
          let minX = width;
          let minY = height;
          let maxX = 0;
          let maxY = 0;

          for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
              const alpha = data[(y * width + x) * 4 + 3];
              if (alpha > 8) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
              }
            }
          }

          if (minX > maxX || minY > maxY) {
            resolve({ dataUrl: "", width: 0, height: 0 });
            return;
          }

          const padding = 40;
          const cropX = Math.max(minX - padding, 0);
          const cropY = Math.max(minY - padding, 0);
          const cropWidth = Math.min(maxX - minX + padding * 2, width - cropX);
          const cropHeight = Math.min(maxY - minY + padding * 2, height - cropY);
          const cropped = document.createElement("canvas");
          cropped.width = cropWidth;
          cropped.height = cropHeight;

          cropped
            .getContext("2d")
            .drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

          console.log("📐 Cropped dimensions:", cropped.width, "x", cropped.height, "aspect ratio:", cropped.width / cropped.height);
          resolve({
            dataUrl: cropped.toDataURL("image/png"),
            width: cropped.width,
            height: cropped.height
          });
        } catch {
          resolve({ dataUrl: "", width: 0, height: 0 });
        }
      };

      image.onerror = () => resolve({ dataUrl: "", width: 0, height: 0 });
      image.src = LOGO_SRC;
    });
  }

  return logoDataUrlPromise;
}
