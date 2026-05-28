import { useState, useEffect } from "react";
import { 
  fetchAdminProfile, 
  updateAdminProfile, 
  fetchSchoolSettings, 
  saveSchoolSettings,
  testPaystackConnection,
  testSmtpConnection,
  saveIntegrationSettings,
  fetchIntegrationSettings
} from "../services/api";
import { 
  Save, 
  Bell, 
  Lock, 
  CreditCard, 
  Mail, 
  Server, 
  School, 
  Upload,
  Settings,
  Shield,
  FileText,
  Key,
  CheckCircle,
  AlertCircle,
  Plug,
  RefreshCw
} from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Profile Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  // School Branding
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [schoolLogoPreview, setSchoolLogoPreview] = useState(null);
  
  // Signatures
  const [registrarSignature, setRegistrarSignature] = useState(null);
  const [registrarPreview, setRegistrarPreview] = useState(null);
  const [principalSignature, setPrincipalSignature] = useState(null);
  const [principalPreview, setPrincipalPreview] = useState(null);

  // System Settings (Local State / Placeholders)
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpEncryption, setSmtpEncryption] = useState("tls");
  const [smtpSenderEmail, setSmtpSenderEmail] = useState("");
  const [smtpSenderName, setSmtpSenderName] = useState("");
  const [tokenPrice, setTokenPrice] = useState("1500");
  const [testingPaystack, setTestingPaystack] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [paystackStatus, setPaystackStatus] = useState("not_connected"); // not_connected, connected, error
  const [smtpStatus, setSmtpStatus] = useState("not_connected");

  useEffect(() => {
    loadProfile();
    loadSchoolSettings();
    loadIntegrationSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await fetchAdminProfile();
      setEmailNotifications(profile.emailNotificationsEnabled);
      setAdminName(profile.name);
      setAdminEmail(profile.email);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadSchoolSettings = async () => {
    try {
      const settings = await fetchSchoolSettings();
      if (settings) {
        setSchoolName(settings.schoolName || "");
        const baseUrl = import.meta.env.VITE_API_BASE_URL 
          ? import.meta.env.VITE_API_BASE_URL.replace("/api", "") 
          : "";
          
        if (settings.schoolLogo) {
          setSchoolLogoPreview(baseUrl + settings.schoolLogo);
        }
        if (settings.registrarSignature) {
          setRegistrarPreview(baseUrl + settings.registrarSignature);
        }
        if (settings.principalSignature) {
          setPrincipalPreview(baseUrl + settings.principalSignature);
        }
      }
    } catch (error) {
      console.error("Failed to load school settings", error);
    }
  };

  const loadIntegrationSettings = async () => {
    try {
      const settings = await fetchIntegrationSettings();
      if (settings) {
        setPaystackPublicKey(settings.paystackPublicKey || "");
        // If the secret key is masked or set, we update the state so UI reflects it
        if (settings.paystackSecretKey) {
            setPaystackSecretKey(settings.paystackSecretKey);
        }
        setTokenPrice(settings.tokenPrice || "1500");
        setSmtpHost(settings.smtpHost || "");
        setSmtpPort(settings.smtpPort || "587");
        setSmtpUser(settings.smtpUser || "");
        // setSmtpPassword(settings.smtpPassword || "");
        setSmtpEncryption(settings.smtpEncryption || "tls");
        setSmtpSenderEmail(settings.smtpSenderEmail || "");
        setSmtpSenderName(settings.smtpSenderName || "");
      }
    } catch (error) {
      console.error("Failed to load integration settings", error);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSchoolLogo(file);
      setSchoolLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRegistrarSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegistrarSignature(file);
      setRegistrarPreview(URL.createObjectURL(file));
    }
  };

  const handlePrincipalSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrincipalSignature(file);
      setPrincipalPreview(URL.createObjectURL(file));
    }
  };

  const handleTestPaystack = async () => {
    setTestingPaystack(true);
    setPaystackStatus("testing");
    try {
      // Use a test email if adminEmail is not set, or prompt user
      const testEmail = adminEmail || "azdigitalsacademy@gmail.com";
      
      // Direct API call to Paystack to verify keys
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: testEmail,
          amount: 10000 // 100 NGN
        })
      });
      
      const data = await response.json();
      if (response.ok && data.status) {
        setPaystackStatus("connected");
        alert("Paystack connection successful");
      } else {
        setPaystackStatus("error");
        alert("Invalid Paystack API keys: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      setPaystackStatus("error");
      alert("Connection failed: " + error.message);
    } finally {
      setTestingPaystack(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setSmtpStatus("testing");
    try {
      // Send test email via backend
      await testSmtpConnection({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPassword,
        encryption: smtpEncryption,
        senderEmail: smtpSenderEmail,
        senderName: smtpSenderName,
        recipient: adminEmail
      });
      setSmtpStatus("connected");
      alert("Email connection successful. A test email has been sent to " + adminEmail);
    } catch (error) {
      setSmtpStatus("error");
      alert("SMTP connection failed: " + (error.response?.data?.error || error.message));
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Update profile settings (Real Backend)
      await updateAdminProfile({
        emailNotificationsEnabled: emailNotifications
      });

      // Save School Settings
      const formData = new FormData();
      formData.append("schoolName", schoolName);
      if (schoolLogo) {
        formData.append("logo", schoolLogo);
      }
      if (registrarSignature) {
        formData.append("registrarSignature", registrarSignature);
      }
      if (principalSignature) {
        formData.append("principalSignature", principalSignature);
      }
      await saveSchoolSettings(formData);
      
      // Save other settings (Real Backend)
      console.log("Saving integration settings...");
      
      // Prepare settings - if secret keys are the masked placeholders, don't send them to backend
      const settingsPayload = {
        paystackPublicKey,
        tokenPrice,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpEncryption,
        smtpSenderEmail,
        smtpSenderName
      };

      if (paystackSecretKey && paystackSecretKey !== "sk_live_********") {
        settingsPayload.paystackSecretKey = paystackSecretKey;
      }
      
      if (smtpPassword && smtpPassword !== "••••••••••••") {
        settingsPayload.smtpPassword = smtpPassword;
      }

      await saveIntegrationSettings(settingsPayload);
      
      // specific success feedback
      const notification = document.createElement("div");
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span class="font-medium">Settings saved successfully</span>
        </div>
      `;
      notification.className = "fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-bottom-5 flex items-center gap-3";
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add("animate-out", "fade-out", "slide-out-to-bottom-5");
        setTimeout(() => notification.remove(), 500);
      }, 3000);

    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "branding", label: "School Branding", icon: School },
    { id: "signatures", label: "Signature Management", icon: FileText },
    { id: "notifications", label: "Email Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Plug },
    { id: "tokens", label: "Token Configuration", icon: Key },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System Preferences", icon: Server },
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Helper to determine status badge
  const StatusBadge = ({ configured, type = "default", status = "" }) => {
    if (type === "mock") return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">Mock Data</span>;
    
    if (status === "testing") {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
          <RefreshCw size={10} className="animate-spin" /> Testing...
        </span>
      );
    }
    if (status === "connected") {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
          <CheckCircle size={10} /> Connected
        </span>
      );
    }
    if (status === "error") {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
          <AlertCircle size={10} /> Connection Failed
        </span>
      );
    }

    // Check for Paystack Configured (including masked keys)
    if (type === 'paystack') {
        const isConfigured = paystackPublicKey && (paystackSecretKey || paystackSecretKey === "sk_live_********");
        if (isConfigured) {
            return (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                  <CheckCircle size={10} /> Configured
                </span>
            );
        }
    }

    return configured ? (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
        <CheckCircle size={10} /> Configured
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
        <AlertCircle size={10} /> Not Configured
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 text-lg">Settings</h2>
              <p className="text-xs text-gray-400 mt-1">System Configuration</p>
            </div>
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon 
                    size={18} 
                    className={`transition-colors duration-200 ${activeTab === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} 
                  />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">General Settings</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage your basic profile information and account details.</p>
                    </div>
                    <StatusBadge configured={true} />
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Admin Name</label>
                      <input
                        type="text"
                        value={adminName}
                        disabled
                        className="input-field bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400">Name associated with this admin account.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <input
                        type="email"
                        value={adminEmail}
                        disabled
                        className="input-field bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400">Primary contact email for system notifications.</p>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* School Branding */}
            {activeTab === "branding" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">School Branding</h3>
                      <p className="text-sm text-gray-500 mt-1">Customize the portal identity, logos, and official names.</p>
                    </div>
                    <StatusBadge configured={!!schoolName && !!schoolLogoPreview} />
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">School Name</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="input-field"
                      placeholder="Enter School Name"
                    />
                    <p className="text-xs text-gray-400">This name will appear on all generated certificates and headers.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">School Logo</label>
                    <div className="flex items-start gap-6 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                      <div className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-white overflow-hidden relative shadow-sm">
                        {schoolLogoPreview ? (
                          <img src={schoolLogoPreview} alt="School Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                          <School className="text-gray-300" size={32} />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all">
                          <Upload size={16} />
                          Upload Logo
                          <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
                        </label>
                        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                          Recommended: PNG or SVG with transparent background.<br/>
                          Max size: 5MB. Dimensions: 200x200px.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Signatures */}
            {activeTab === "signatures" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Signature Management</h3>
                      <p className="text-sm text-gray-500 mt-1">Upload official digital signatures for automated certificate generation.</p>
                    </div>
                    <StatusBadge configured={!!registrarPreview && !!principalPreview} />
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Registrar Signature */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 flex justify-between">
                      Registrar Signature
                      {registrarPreview && <span className="text-green-600 text-xs font-normal flex items-center gap-1"><CheckCircle size={10} /> Uploaded</span>}
                    </label>
                    <div className="flex flex-col gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                      <div className="w-full h-32 border border-gray-200 rounded-lg flex items-center justify-center bg-white overflow-hidden relative shadow-sm group">
                        {registrarPreview ? (
                          <img src={registrarPreview} alt="Registrar Signature" className="max-w-full max-h-full object-contain p-4" />
                        ) : (
                          <span className="text-xs text-gray-400 text-center px-2">No Signature</span>
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all">
                          <Upload size={16} />
                          Upload File
                          <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleRegistrarSignatureChange} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Principal Signature */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 flex justify-between">
                      Principal Signature
                      {principalPreview && <span className="text-green-600 text-xs font-normal flex items-center gap-1"><CheckCircle size={10} /> Uploaded</span>}
                    </label>
                    <div className="flex flex-col gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                      <div className="w-full h-32 border border-gray-200 rounded-lg flex items-center justify-center bg-white overflow-hidden relative shadow-sm">
                        {principalPreview ? (
                          <img src={principalPreview} alt="Principal Signature" className="max-w-full max-h-full object-contain p-4" />
                        ) : (
                          <span className="text-xs text-gray-400 text-center px-2">No Signature</span>
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all">
                          <Upload size={16} />
                          Upload File
                          <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handlePrincipalSignatureChange} />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p>For best results, use high-resolution PNG images with transparent backgrounds. Max file size: 5MB.</p>
                  </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Email Notifications */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500 mt-1">Configure when and how you receive system alerts.</p>
                    </div>
                    <StatusBadge configured={emailNotifications} />
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                    <div className="flex items-center h-6">
                      <input
                        id="email-notifications"
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="email-notifications" className="font-semibold text-gray-900 cursor-pointer">Enable System Alerts</label>
                      <p className="text-gray-500 text-sm mt-1">Receive immediate email alerts for important system events such as new result uploads, successful payments, and security warnings.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 pl-2">
                    <Mail size={16} />
                    Emails will be sent to: <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{adminEmail}</span>
                  </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === "integrations" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Paystack Payment Configuration</h3>
                          <p className="text-sm text-gray-500 mt-1">Configure Paystack API keys used for token purchases and payment processing.</p>
                        </div>
                      </div>
                      <StatusBadge configured={!!paystackPublicKey && !!paystackSecretKey} status={paystackStatus} type="paystack" />
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Public Key</label>
                        <div className="relative">
                          <Key size={16} className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="text"
                            value={paystackPublicKey}
                            onChange={(e) => setPaystackPublicKey(e.target.value)}
                            className="input-field pl-10 font-mono text-sm"
                            placeholder="pk_live_..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Secret Key</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="password"
                            value={paystackSecretKey}
                            onChange={(e) => setPaystackSecretKey(e.target.value)}
                            className="input-field pl-10 font-mono text-sm"
                            placeholder="sk_live_..."
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Token Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₦</span>
                        <input
                          type="number"
                          value={tokenPrice}
                          onChange={(e) => setTokenPrice(e.target.value)}
                          className="input-field pl-8 max-w-[200px]"
                          placeholder="500"
                        />
                        <span className="ml-2 text-sm text-gray-500 font-medium">NGN</span>
                      </div>
                      <p className="text-xs text-gray-400">Current price per result access token.</p>
                    </div>
                  </div>
                  <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={handleTestPaystack}
                      disabled={testingPaystack || !paystackSecretKey}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {testingPaystack ? <RefreshCw size={16} className="animate-spin" /> : null}
                      Test Connection
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <Mail size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">SMTP Email Configuration</h3>
                          <p className="text-sm text-gray-500 mt-1">Configure the outgoing mail server used for system notifications and alerts.</p>
                        </div>
                      </div>
                      <StatusBadge configured={!!smtpHost && !!smtpUser} status={smtpStatus} />
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">SMTP Host</label>
                        <div className="relative">
                          <Server size={16} className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="text"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            className="input-field pl-10"
                            placeholder="smtp.example.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">SMTP Port</label>
                        <input
                          type="number"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                          className="input-field"
                          placeholder="587"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">SMTP Username</label>
                        <input
                          type="text"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          className="input-field"
                          placeholder="azdigitalsacademy@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">SMTP Password</label>
                        <input
                          type="password"
                          value={smtpPassword}
                          onChange={(e) => setSmtpPassword(e.target.value)}
                          className="input-field"
                          placeholder="••••••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Encryption Type</label>
                        <select 
                          value={smtpEncryption}
                          onChange={(e) => setSmtpEncryption(e.target.value)}
                          className="input-field"
                        >
                          <option value="none">None</option>
                          <option value="tls">TLS</option>
                          <option value="ssl">SSL</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Sender Email Address</label>
                        <input
                          type="email"
                          value={smtpSenderEmail}
                          onChange={(e) => setSmtpSenderEmail(e.target.value)}
                          className="input-field"
                          placeholder="no-reply@itmt.edu.ng"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Sender Name</label>
                        <input
                          type="text"
                          value={smtpSenderName}
                          onChange={(e) => setSmtpSenderName(e.target.value)}
                          className="input-field"
                        placeholder="ITMT Portal"
                      />
                    </div>
                  </div>
                  </div>
                  <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={handleTestSmtp}
                      disabled={testingSmtp || !smtpHost}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {testingSmtp ? <RefreshCw size={16} className="animate-spin" /> : null}
                      Test Email Connection
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Token Configuration */}
            {activeTab === "tokens" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Token Configuration</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage token pricing, limits, and generation rules.</p>
                    </div>
                    <StatusBadge configured={true} />
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Token Price (₦)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₦</span>
                      <input
                        type="number"
                        value={tokenPrice}
                        onChange={(e) => setTokenPrice(e.target.value)}
                        className="input-field pl-8"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Cost per token for student purchase.</p>
                  </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-75 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage payment gateways, API keys, and access controls.</p>
                    </div>
                    <StatusBadge type="mock" />
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Session Timeout</label>
                    <select className="input-field" disabled>
                      <option>30 Minutes</option>
                      <option>1 Hour</option>
                      <option>4 Hours</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Two-Factor Auth</label>
                    <div className="flex items-center h-10">
                      <span className="text-sm text-gray-500">Currently Disabled</span>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button type="button" disabled className="btn-primary opacity-50 cursor-not-allowed">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* System Preferences */}
            {activeTab === "system" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-75 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">System Preferences</h3>
                      <p className="text-sm text-gray-500 mt-1">Configure global system settings and defaults.</p>
                    </div>
                    <StatusBadge type="mock" />
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Time Zone</label>
                    <select className="input-field" disabled>
                      <option>Africa/Lagos (GMT+1)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Date Format</label>
                    <select className="input-field" disabled>
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button type="button" disabled className="btn-primary opacity-50 cursor-not-allowed">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Certificate Settings */}
            {activeTab === "certificates" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Certificate Settings</h3>
                      <p className="text-sm text-gray-500 mt-1">Configure certificate templates and verification options.</p>
                    </div>
                    <StatusBadge type="mock" />
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Certificate Template</label>
                    <select className="input-field" disabled>
                      <option>Classic Blue Border</option>
                      <option>Modern Minimalist</option>
                      <option>Traditional Gold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Serial Number Format</label>
                    <input type="text" className="input-field" placeholder="ITMT-{YEAR}-{SEQ}" disabled />
                    <p className="text-xs text-gray-400">Format used for generating unique certificate serial numbers.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Verification URL</label>
                    <input type="text" className="input-field bg-gray-50" value="https://portal.itmt.edu.ng/verify" disabled />
                  </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button type="button" disabled className="btn-primary opacity-50 cursor-not-allowed">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>

      <style>{`
        .btn-primary {
          @apply inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed active:transform active:scale-95;
        }
        .input-field {
          @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-400;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
