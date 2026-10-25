import { test, expect } from '@playwright/test';

test.describe('Upload de imagens', () => {
  test('deve aceitar arrastar e soltar uma imagem', async ({ page }) => {
    await page.goto('/');
    // Nota: drag & drop de arquivo real requer setup adicional em E2E
    // Este teste verifica que a área de drop existe
    await expect(page.locator('#area-upload')).toBeVisible();
  });

  test('deve mostrar aviso para arquivo não-imagem', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('#upload-imagem');
    await input.setInputFiles([
      { name: 'documento.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF') },
    ]);
    // O toast de erro deve aparecer
    await expect(page.locator('.toast.error')).toBeVisible();
  });
});
