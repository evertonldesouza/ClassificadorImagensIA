import { test, expect } from '@playwright/test';

test.setTimeout(60000);

/**
 * Aguarda o modelo de IA carregar completamente antes de continuar.
 * O TensorFlow.js pode demorar para baixar e carregar o MobileNet.
 */
async function aguardarModeloCarregar(page) {
  await page.goto('/');
  // Aguarda o status de carregamento aparecer e depois sumir (modelo pronto)
  const statusModelo = page.locator('#status-modelo');
  await expect(statusModelo).toBeVisible();
  // Aguarda até que o modelo esteja pronto (status muda para 'ready')
  await page.waitForFunction(() => {
    const el = document.querySelector('#status-modelo');
    return el?.textContent?.includes('Modelo carregado com sucesso');
  }, { timeout: 120000 });
}

test.describe('Classificador de Imagens IA', () => {
  test('deve carregar a página e exibir o cabeçalho', async ({ page }) => {
    await aguardarModeloCarregar(page);
    await expect(page.locator('h1')).toContainText('Image.classify');
    await expect(page.locator('.header-badge')).toContainText('VISION AI');
  });

  test('deve exibir o status de carregamento do modelo', async ({ page }) => {
    await aguardarModeloCarregar(page);
    await expect(page.locator('#status-modelo')).toBeVisible();
  });

  test('deve alternar entre tema claro e escuro', async ({ page }) => {
    await aguardarModeloCarregar(page);
    const btnTema = page.locator('#theme-toggle');
    await expect(document.body).not.toHaveClass('light');
    await btnTema.click();
    await expect(page.locator('body')).toHaveClass(/light/);
    await btnTema.click();
    await expect(page.locator('body')).not.toHaveClass(/light/);
  });

  test('deve selecionar o modelo COCO-SSD e exibir progresso', async ({ page }) => {
    await aguardarModeloCarregar(page);
    await page.click('.modelo-card[data-model="coco-ssd"]');
    await expect(page.locator('.modelo-card[data-model="coco-ssd"]')).toHaveClass(/active/);
    await expect(page.locator('#modelo-progresso')).toBeVisible();
  });

  test('deve selecionar o modelo MobileNet', async ({ page }) => {
    await aguardarModeloCarregar(page);
    await page.click('.modelo-card[data-model="coco-ssd"]');
    await page.click('.modelo-card[data-model="mobilenet"]');
    await expect(page.locator('.modelo-card[data-model="mobilenet"]')).toHaveClass(/active/);
  });

  test('deve ajustar o limite de confiança', async ({ page }) => {
    await aguardarModeloCarregar(page);
    const slider = page.locator('#conf-threshold');
    await slider.fill('50');
    await expect(page.locator('#conf-threshold-value')).toContainText('50%');
  });

  test('deve abrir a área de upload ao clicar no botão', async ({ page }) => {
    await aguardarModeloCarregar(page);
    await page.click('#btn-upload');
    await expect(page.locator('#area-upload')).not.toHaveClass(/hidden/);
  });

  test('deve alternar a câmera', async ({ page }) => {
    await aguardarModeloCarregar(page);
    await page.click('#btn-webcam');
    await expect(page.locator('#camera-controls')).not.toHaveClass(/hidden/);
    await page.click('#btn-parar');
    await expect(page.locator('#camera-controls')).toHaveClass(/hidden/);
  });

  test('deve ativar e desativar o tempo real', async ({ page }) => {
    await aguardarModeloCarregar(page);
    await page.click('#btn-tempo-real');
    await expect(page.locator('#btn-tempo-real')).toHaveClass(/ativo/);
    await page.click('#btn-tempo-real');
    await expect(page.locator('#btn-tempo-real')).not.toHaveClass(/ativo/);
  });

  test('deve exibir o histórico quando há análises', async ({ page }) => {
    await aguardarModeloCarregar(page);
    // O histórico começa vazio
    await expect(page.locator('#historico')).toHaveClass(/hidden/);
  });

  test('deve usar atalhos de teclado', async ({ page }) => {
    await aguardarModeloCarregar(page);
    // Tecla '1' seleciona MobileNet
    await page.press('body', '1');
    await expect(page.locator('.modelo-card[data-model="mobilenet"]')).toHaveClass(/active/);
    // Tecla '2' seleciona COCO-SSD
    await page.press('body', '2');
    await expect(page.locator('.modelo-card[data-model="coco-ssd"]')).toHaveClass(/active/);
  });
});
