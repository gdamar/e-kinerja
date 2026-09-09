# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tugas-flow.spec.ts >> Full Tugas Flow Test >> Complete flow: Create tugas -> Verify in list -> Login as petugas -> See assigned task
- Location: tests/tugas-flow.spec.ts:14:3

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: page.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('text=Profil')
    - locator resolved to <span class="text-xs">Profil</span>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    161 × waiting for element to be visible, enabled and stable
        - element is not visible
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - complementary [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: EK
      - generic [ref=e9]: E-Kinerja
    - navigation [ref=e10]:
      - link "Beranda" [ref=e11] [cursor=pointer]:
        - /url: /dashboard
      - link "Tugas" [ref=e16] [cursor=pointer]:
        - /url: /tugas
      - link "Cuti" [ref=e21] [cursor=pointer]:
        - /url: /cuti
      - link "Penilaian" [ref=e25] [cursor=pointer]:
        - /url: /penilaian
      - link "Petugas" [ref=e30] [cursor=pointer]:
        - /url: /petugas
      - link "Akun" [ref=e37] [cursor=pointer]:
        - /url: /akun
      - link "Laporan" [ref=e51] [cursor=pointer]:
        - /url: /laporan
    - generic [ref=e55]:
      - generic [ref=e56]:
        - generic [ref=e57]: AH
        - generic [ref=e59]:
          - paragraph [ref=e60]: Ahmad Wijaya
          - paragraph [ref=e61]: operator
      - button "Collapse" [ref=e62] [cursor=pointer]
      - button "Keluar" [ref=e66] [cursor=pointer]
  - main [ref=e71]:
    - generic [ref=e72]:
      - button "Kembali" [ref=e73] [cursor=pointer]
      - heading "Tambah Tugas Baru" [level=1] [ref=e76]
      - generic [ref=e79]:
        - generic [ref=e80]:
          - text: Petugas (Pilih satu atau lebih)
          - generic [ref=e82]:
            - generic [ref=e83]: Budi Santoso
            - button [ref=e84] [cursor=pointer]
          - button "1 petugas dipilih" [ref=e88] [cursor=pointer]
        - generic [ref=e91]:
          - text: Judul Tugas
          - textbox "Judul Tugas Judul Tugas" [ref=e93]:
            - /placeholder: "Contoh: Perbaikan Pipa Bocor"
            - text: Test Tugas Lengkap 1788879403299
        - generic [ref=e94]:
          - text: Alamat / Lokasi
          - textbox "Alamat / Lokasi Alamat / Lokasi" [ref=e96]:
            - /placeholder: "Contoh: jalan Melati No. 5, RT 03"
            - text: Jl. Test Automasi No. 999
        - generic [ref=e97]:
          - text: Tanggal Tugas
          - textbox "Tanggal Tugas Tanggal Tugas" [ref=e99]: 2026-09-08
        - button "Simpan Tugas" [ref=e100] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Full Tugas Flow Test', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('http://localhost:5173/login');
  6  |     await page.waitForLoadState('networkidle');
  7  |     await page.fill('input[type="email"]', 'ahmad@test.local');
  8  |     await page.fill('input[type="password"]', 'test123');
  9  |     await page.click('button[type="submit"]');
  10 |     await page.waitForURL('**/dashboard');
  11 |     await page.waitForLoadState('networkidle');
  12 |   });
  13 | 
  14 |   test('Complete flow: Create tugas -> Verify in list -> Login as petugas -> See assigned task', async ({ page }) => {
  15 |     const taskTitle = `Test Tugas Lengkap ${Date.now()}`;
  16 | 
  17 |     // ========== STEP 1: Create tugas ==========
  18 |     console.log('Step 1: Creating tugas...');
  19 | 
  20 |     await page.click('text=Tugas Baru');
  21 |     await page.waitForURL('**/tugas/baru');
  22 |     await page.waitForLoadState('networkidle');
  23 | 
  24 |     // Open dialog
  25 |     await page.locator('[aria-haspopup="dialog"]').first().click();
  26 |     await expect(page.locator('h2:has-text("Pilih Petugas")')).toBeVisible({ timeout: 5000 });
  27 |     await page.waitForTimeout(500);
  28 | 
  29 |     // Select first petugas (budi)
  30 |     const petugasList = page.locator('[role="dialog"] button').filter({ hasText: /NIK/ });
  31 |     const count = await petugasList.count();
  32 |     console.log(`  Found ${count} petugas options`);
  33 | 
  34 |     if (count > 0) {
  35 |       await petugasList.first().click();
  36 |       await page.waitForTimeout(300);
  37 |     }
  38 | 
  39 |     // Close dialog
  40 |     await page.locator('button:has-text("Selesai")').last().click();
  41 |     await page.waitForTimeout(500);
  42 | 
  43 |     // Fill form
  44 |     await page.fill('input[id="judul_tugas"]', taskTitle);
  45 |     await page.fill('input[id="alamat"]', 'Jl. Test Automasi No. 999');
  46 | 
  47 |     // Submit
  48 |     await page.click('button[type="submit"]');
  49 |     await page.waitForTimeout(3000);
  50 | 
  51 |     const createUrl = page.url();
  52 |     console.log(`  After submit URL: ${createUrl}`);
  53 | 
  54 |     // Check if redirected to tugas list
  55 |     if (!createUrl.includes('/tugas')) {
  56 |       // Check for error
  57 |       const errorMsg = await page.locator('text=Gagal').isVisible().catch(() => false);
  58 |       if (errorMsg) {
  59 |         console.log('  ❌ Form submission failed - error message shown');
  60 |       } else {
  61 |         console.log(`  ⚠️ URL not changed to /tugas: ${createUrl}`);
  62 |       }
  63 |     } else {
  64 |       console.log('  ✅ Redirected to tugas list');
  65 | 
  66 |       // ========== STEP 2: Verify task in list ==========
  67 |       console.log('Step 2: Verifying task in list...');
  68 |       await page.waitForLoadState('networkidle');
  69 | 
  70 |       // Find the task
  71 |       const taskExists = await page.locator(`text=${taskTitle}`).isVisible().catch(() => false);
  72 |       if (taskExists) {
  73 |         console.log(`  ✅ Task "${taskTitle}" found in list`);
  74 |       } else {
  75 |         console.log(`  ⚠️ Task "${taskTitle}" not found in list`);
  76 |       }
  77 | 
  78 |       // ========== STEP 3: Login as petugas (budi) ==========
  79 |       console.log('Step 3: Login as petugas (budi) to check assigned tasks...');
> 80 |       await page.click('text=Profil');
     |                  ^ Error: page.click: Test timeout of 90000ms exceeded.
  81 |       await page.waitForTimeout(500);
  82 | 
  83 |       // Logout would be here, but for simplicity we'll just note the test passed
  84 |       console.log('  ✅ Task creation flow completed');
  85 |     }
  86 |   });
  87 | });
  88 | 
```