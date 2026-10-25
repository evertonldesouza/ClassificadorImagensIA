import { test, expect } from '@playwright/test';

test.setTimeout(60000);

/**
 * Aguarda o modelo de IA carregar completamente antes de continuar.
 */
async function aguardarModeloCarregar(page) {
  await page.goto('/');
  const statusModelo = page.locator('#status-modelo');
  await expect(statusModelo).toBeVisible();
  await page.waitForFunction(() => {
    const el = document.querySelector('#status-modelo');
    return el?.textContent?.includes('Modelo carregado com sucesso');
  }, { timeout: 120000 });
}

test.describe('Upload de imagens', () => {
  test('deve exibir a área de upload', async ({ page }) => {
    await aguardarModeloCarregar(page);
    await expect(page.locator('#area-upload')).toBeVisible();
  });

  test('deve mostrar aviso para arquivo não-imagem', async ({ page }) => {
    await aguardarModeloCarregar(page);
    const input = page.locator('#upload-imagem');
    await input.setInputFiles([
      { name: 'documento.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF') },
    ]);
    // O toast de erro deve aparecer
    await expect(page.locator('.toast.error')).toBeVisible({ timeout: 10000 });
  });
});
