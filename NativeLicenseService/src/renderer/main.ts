// Type definitions for Electron API
export interface ElectronAPI {
  getHardwareId: () => Promise<string>;
  activateLicense: (data: {
    licenseKey: string;
    productId: string;
    customerEmail?: string;
    customerName?: string;
  }) => Promise<{ success: boolean; data?: any; message?: string }>;
  verifyLicense: (activationToken: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  deactivateLicense: (activationToken: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  windowIsMaximized: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Get DOM elements
const activationForm = document.getElementById('activationForm') as HTMLFormElement;
const verifyForm = document.getElementById('verifyForm') as HTMLFormElement;
const activationCard = document.getElementById('activationCard') as HTMLElement;
const verificationCard = document.getElementById('verificationCard') as HTMLElement;
const activateTabContent = document.getElementById('activateTabContent') as HTMLElement;
const verifyTabContent = document.getElementById('verifyTabContent') as HTMLElement;
const messageDiv = document.getElementById('message') as HTMLElement;
const activateBtn = document.getElementById('activateBtn') as HTMLButtonElement;
const backBtn = document.getElementById('backBtn') as HTMLButtonElement;
const activateTab = document.getElementById('activateTab') as HTMLButtonElement;
const verifyTab = document.getElementById('verifyTab') as HTMLButtonElement;
const tabs = document.querySelector('.tabs') as HTMLElement;
const minimizeBtn = document.getElementById('minimizeBtn') as HTMLButtonElement;
const maximizeBtn = document.getElementById('maximizeBtn') as HTMLButtonElement;
const closeBtn = document.getElementById('closeBtn') as HTMLButtonElement;
const maximizeIcon = document.getElementById('maximizeIcon') as HTMLElement;
const restoreIcon = document.getElementById('restoreIcon') as HTMLElement;
const currentLicenseCard = document.getElementById('currentLicenseCard') as HTMLElement;
const refreshLicenseBtn = document.getElementById('refreshLicenseBtn') as HTMLButtonElement;
const clearLicenseBtn = document.getElementById('clearLicenseBtn') as HTMLButtonElement;
const passwordModal = document.getElementById('passwordModal') as HTMLElement;
const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
const confirmClearBtn = document.getElementById('confirmClearBtn') as HTMLButtonElement;
const cancelClearBtn = document.getElementById('cancelClearBtn') as HTMLButtonElement;
const passwordError = document.getElementById('passwordError') as HTMLElement;

// Password for clearing license data
const CLEAR_LICENSE_PASSWORD = 'Tar35700';

// Initialize hardware ID on load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const hardwareId = await window.electronAPI.getHardwareId();
    const hardwareIdInput = document.getElementById('hardwareId') as HTMLInputElement;
    hardwareIdInput.value = hardwareId;
  } catch (error) {
    showMessage('เกิดข้อผิดพลาดในการตรวจจับรหัสอุปกรณ์', 'error');
  }

  // Update maximize button icon
  updateMaximizeIcon();
  
  // Load and display current activated license
  loadCurrentLicense();
});

// Window Controls
if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => {
    window.electronAPI.windowMinimize();
  });
}

if (maximizeBtn) {
  maximizeBtn.addEventListener('click', async () => {
    await window.electronAPI.windowMaximize();
    updateMaximizeIcon();
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    window.electronAPI.windowClose();
  });
}

async function updateMaximizeIcon() {
  const isMaximized = await window.electronAPI.windowIsMaximized();
  if (maximizeIcon && restoreIcon) {
    maximizeIcon.style.display = isMaximized ? 'none' : 'block';
    restoreIcon.style.display = isMaximized ? 'block' : 'none';
  }
}

// Handle activation form submission
activationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const productId = (document.getElementById('productId') as HTMLInputElement).value.trim();
  const licenseKey = (document.getElementById('licenseKey') as HTMLInputElement).value.trim();
  const customerName = (document.getElementById('customerName') as HTMLInputElement).value.trim();
  const customerEmail = (document.getElementById('customerEmail') as HTMLInputElement).value.trim();

    if (!productId || !licenseKey) {
    showMessage('กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน', 'error');
    return;
  }

  activateBtn.disabled = true;
  activateBtn.textContent = 'กำลังเปิดใช้งาน...';

  try {
    const result = await window.electronAPI.activateLicense({
      licenseKey,
      productId,
      customerName: customerName || undefined,
      customerEmail: customerEmail || undefined,
    });

    if (result.success && result.data) {
      // Verify to get full license info
      const verifyResult = await window.electronAPI.verifyLicense(result.data.token);
      if (verifyResult.success && verifyResult.data) {
        const fullData = {
          ...verifyResult.data,
          token: result.data.token,
        };
        
        // Save activation token to localStorage
        const activationData = {
          token: result.data.token,
          productId: fullData.productId || productId,
          licenseKey: licenseKey,
          activatedAt: fullData.activatedAt || new Date().toISOString(),
        };
        localStorage.setItem('activatedLicense', JSON.stringify(activationData));
        
        // Always show current license card first
        showCurrentLicense(fullData);
        
        // Then show the verification status overlay
        showLicenseStatus(fullData);
        showMessage('เปิดใช้งานใบอนุญาตสำเร็จ!', 'success');
      } else {
        showMessage('เปิดใช้งานสำเร็จ แต่ไม่สามารถตรวจสอบข้อมูลได้', 'success');
      }
    } else {
      showMessage(result.message || 'การเปิดใช้งานล้มเหลว', 'error');
    }
  } catch (error: any) {
    showMessage(error.message || 'เกิดข้อผิดพลาดระหว่างการเปิดใช้งาน', 'error');
  } finally {
    activateBtn.disabled = false;
    activateBtn.textContent = 'เปิดใช้งานใบอนุญาต';
  }
});

// Handle verification form submission
verifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const activationToken = (document.getElementById('activationToken') as HTMLInputElement).value.trim();

    if (!activationToken) {
    showMessage('กรุณากรอกโทเค็นการเปิดใช้งาน', 'error');
    return;
  }

  try {
    const result = await window.electronAPI.verifyLicense(activationToken);

        if (result.success && result.data) {
          if (result.data.valid) {
            const licenseData = {
              token: activationToken,
              productId: result.data.productId,
              status: result.data.status,
              activatedAt: result.data.activatedAt,
            };
            
            // Save to localStorage
            localStorage.setItem('activatedLicense', JSON.stringify({
              token: activationToken,
              productId: result.data.productId,
              activatedAt: result.data.activatedAt,
            }));
            
            // Always show current license card first
            showCurrentLicense(licenseData);
            
            // Then show the verification status overlay
            showLicenseStatus(licenseData);
            showMessage('ใบอนุญาตถูกต้อง!', 'success');
          } else {
            showMessage('ใบอนุญาตไม่ถูกต้อง', 'error');
          }
        } else {
          showMessage(result.message || 'การตรวจสอบล้มเหลว', 'error');
        }
  } catch (error: any) {
    showMessage(error.message || 'เกิดข้อผิดพลาดระหว่างการตรวจสอบ', 'error');
  }
});

// Show license status (overlay)
function showLicenseStatus(data: any) {
  const statusText = document.getElementById('statusText') as HTMLElement;
  const productText = document.getElementById('productText') as HTMLElement;
  const activatedText = document.getElementById('activatedText') as HTMLElement;
  const tokenText = document.getElementById('tokenText') as HTMLElement;

  const status = data.status || 'activated';
  const statusMap: { [key: string]: string } = {
    'activated': 'เปิดใช้งานแล้ว',
    'available': 'พร้อมใช้งาน',
    'expired': 'หมดอายุ',
    'revoked': 'ถูกยกเลิก'
  };
  const statusThai = statusMap[status] || status;
  const badgeText = status === 'activated' ? 'ใช้งานได้' : status === 'available' ? 'พร้อมใช้งาน' : 'ตรวจสอบ';
  statusText.innerHTML = `${statusThai} <span class="badge badge-${status === 'activated' ? 'success' : 'info'}">${badgeText}</span>`;

  productText.textContent = data.productId || 'ไม่ระบุ';

  if (data.activatedAt) {
    const date = new Date(data.activatedAt);
    activatedText.textContent = date.toLocaleString('th-TH');
  } else {
    activatedText.textContent = 'ไม่ระบุ';
  }

  tokenText.textContent = data.token || 'ไม่ระบุ';

  // Hide tabs but keep current license card visible
  activateTabContent.style.display = 'none';
  verifyTabContent.style.display = 'none';
  verificationCard.style.display = 'block';
}

// Tab switching
activateTab.addEventListener('click', () => {
  switchTab('activate');
});

verifyTab.addEventListener('click', () => {
  switchTab('verify');
});

function switchTab(tabName: 'activate' | 'verify') {
  // Only switch tabs if tabs are visible
  if (tabs && tabs.style.display !== 'none') {
    // Update tab buttons
    activateTab.classList.toggle('active', tabName === 'activate');
    verifyTab.classList.toggle('active', tabName === 'verify');
    
    // Update tab content
    activateTabContent.classList.toggle('active', tabName === 'activate');
    verifyTabContent.classList.toggle('active', tabName === 'verify');
  }

  // Hide verification card if showing
  verificationCard.style.display = 'none';
}

// Back button handler
backBtn.addEventListener('click', () => {
  verificationCard.style.display = 'none';
  activationForm.reset();
  verifyForm.reset();

  // Switch to activate tab
  switchTab('activate');

  // Reload hardware ID
  window.electronAPI.getHardwareId().then((hwid: string) => {
    const hardwareIdInput = document.getElementById('hardwareId') as HTMLInputElement;
    hardwareIdInput.value = hwid;
  });
  
  // Current license card stays visible if activated
});

// Load and display current activated license
async function loadCurrentLicense() {
  const savedLicense = localStorage.getItem('activatedLicense');
  if (savedLicense) {
    try {
      const licenseData = JSON.parse(savedLicense);
      if (licenseData.token) {
        // Verify the token is still valid
        const verifyResult = await window.electronAPI.verifyLicense(licenseData.token);
        if (verifyResult.success && verifyResult.data && verifyResult.data.valid) {
          // Show current license info
          showCurrentLicense({
            ...verifyResult.data,
            token: licenseData.token,
          });
          return;
        }
      }
    } catch (error) {
      // If verification fails, clear invalid data
      localStorage.removeItem('activatedLicense');
      currentLicenseCard.style.display = 'none';
      // Show tabs if no valid license
      if (tabs) tabs.style.display = 'flex';
    }
  } else {
    currentLicenseCard.style.display = 'none';
    // Show tabs if no license saved
    if (tabs) tabs.style.display = 'flex';
  }
}

// Show current activated license
function showCurrentLicense(data: any) {
  const statusText = document.getElementById('currentStatusText') as HTMLElement;
  const productText = document.getElementById('currentProductText') as HTMLElement;
  const activatedText = document.getElementById('currentActivatedText') as HTMLElement;
  const tokenText = document.getElementById('currentTokenText') as HTMLElement;

  const status = data.status || 'activated';
  const statusMap: { [key: string]: string } = {
    'activated': 'เปิดใช้งานแล้ว',
    'available': 'พร้อมใช้งาน',
    'expired': 'หมดอายุ',
    'revoked': 'ถูกยกเลิก'
  };
  const statusThai = statusMap[status] || status;
  const badgeText = status === 'activated' ? 'ใช้งานได้' : status === 'available' ? 'พร้อมใช้งาน' : 'ตรวจสอบ';
  statusText.innerHTML = `${statusThai} <span class="badge badge-${status === 'activated' ? 'success' : 'info'}">${badgeText}</span>`;

  productText.textContent = data.productId || 'ไม่ระบุ';

  if (data.activatedAt) {
    const date = new Date(data.activatedAt);
    activatedText.textContent = date.toLocaleString('th-TH');
  } else {
    activatedText.textContent = 'ไม่ระบุ';
  }

  tokenText.textContent = data.token || 'ไม่ระบุ';

  currentLicenseCard.style.display = 'block';
  
  // Hide activation form when license is activated
  if (status === 'activated') {
    if (tabs) tabs.style.display = 'none';
    activateTabContent.style.display = 'none';
    verifyTabContent.style.display = 'none';
  } else {
    // Show tabs if license is not activated
    if (tabs) tabs.style.display = 'flex';
  }
}

// Refresh license button
if (refreshLicenseBtn) {
  refreshLicenseBtn.addEventListener('click', async () => {
    await loadCurrentLicense();
    showMessage('รีเฟรชข้อมูลใบอนุญาตแล้ว', 'success');
  });
}

// Clear license button
if (clearLicenseBtn) {
  clearLicenseBtn.addEventListener('click', () => {
    // Show password dialog
    passwordModal.style.display = 'flex';
    passwordInput.value = '';
    passwordError.style.display = 'none';
    passwordInput.focus();
  });
}

// Password modal handlers
if (confirmClearBtn) {
  confirmClearBtn.addEventListener('click', async () => {
    const enteredPassword = passwordInput.value.trim();
    
    if (!enteredPassword) {
      passwordError.textContent = 'กรุณากรอกรหัสผ่าน';
      passwordError.style.display = 'block';
      return;
    }
    
    if (enteredPassword === CLEAR_LICENSE_PASSWORD) {
      // Password correct - deactivate license on backend first
      const savedLicense = localStorage.getItem('activatedLicense');
      console.log('[Clear] Saved license:', savedLicense);
      
      if (savedLicense) {
        try {
          const licenseData = JSON.parse(savedLicense);
          console.log('[Clear] License data:', licenseData);
          
          if (licenseData.token) {
            console.log('[Clear] Calling deactivate with token:', licenseData.token);
            
            // Deactivate on backend
            const deactivateResult = await window.electronAPI.deactivateLicense(licenseData.token);
            console.log('[Clear] Deactivate result:', deactivateResult);
            
            if (!deactivateResult.success) {
              const errorMsg = deactivateResult.message || 'ไม่สามารถยกเลิกใบอนุญาตได้';
              console.error('[Clear] Deactivation failed:', errorMsg, deactivateResult);
              showMessage(`ไม่สามารถยกเลิกใบอนุญาตได้: ${errorMsg}`, 'error');
              passwordModal.style.display = 'none';
              return;
            }
            
            console.log('[Clear] Deactivation successful');
          } else {
            console.warn('[Clear] No token found in license data');
          }
        } catch (error: any) {
          // If deactivation fails, still clear local storage
          console.error('[Clear] Deactivation error:', error);
          showMessage(`เกิดข้อผิดพลาด: ${error.message || 'ไม่ทราบสาเหตุ'}`, 'error');
          passwordModal.style.display = 'none';
          return;
        }
      } else {
        console.log('[Clear] No saved license found');
      }
      
      // Clear license data from local storage
      localStorage.removeItem('activatedLicense');
      currentLicenseCard.style.display = 'none';
      passwordModal.style.display = 'none';
      
      // Hide verification card if showing
      verificationCard.style.display = 'none';
      
      // Show tabs and form again after clearing
      if (tabs) tabs.style.display = 'flex';
      activateTabContent.style.display = 'flex';
      activateTabContent.classList.add('active');
      verifyTabContent.style.display = 'none';
      verifyTabContent.classList.remove('active');
      
      // Update tab buttons
      activateTab.classList.add('active');
      verifyTab.classList.remove('active');
      
      // Reset forms
      activationForm.reset();
      verifyForm.reset();
      
      // Reload hardware ID
      try {
        const hardwareId = await window.electronAPI.getHardwareId();
        const hardwareIdInput = document.getElementById('hardwareId') as HTMLInputElement;
        if (hardwareIdInput) {
          hardwareIdInput.value = hardwareId;
        }
      } catch (error) {
        console.error('Error reloading hardware ID:', error);
      }
      
      showMessage('ล้างข้อมูลและยกเลิกใบอนุญาตแล้ว', 'success');
    } else {
      // Password incorrect
      passwordError.textContent = 'รหัสผ่านไม่ถูกต้อง';
      passwordError.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
}

if (cancelClearBtn) {
  cancelClearBtn.addEventListener('click', () => {
    passwordModal.style.display = 'none';
    passwordInput.value = '';
    passwordError.style.display = 'none';
  });
}

// Close modal when clicking outside
if (passwordModal) {
  passwordModal.addEventListener('click', (e) => {
    if (e.target === passwordModal) {
      passwordModal.style.display = 'none';
      passwordInput.value = '';
      passwordError.style.display = 'none';
    }
  });
}

// Enter key to confirm password
if (passwordInput) {
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      confirmClearBtn.click();
    }
  });
}

// Show message
function showMessage(text: string, type: 'success' | 'error') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';

  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

