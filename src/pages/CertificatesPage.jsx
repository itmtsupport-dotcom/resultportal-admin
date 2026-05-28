import { 
  Plus, 
  FileText, 
  CheckCircle, 
  Trash2, 
  Edit, 
  Eye, 
  Award,
  X,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { 
  fetchSchoolSettings,
  fetchCertificateTemplates,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  activateCertificateTemplate
} from "../services/api";

const CertificatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolSettings, setSchoolSettings] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateHtml: "",
    isActive: false
  });

  // Prepare Signatures HTML (Standardized Sizing)
  const getSignatureHtml = (path, label) => {
    if (!path) return `<div style="width: 200px; border-bottom: 1px solid #333; margin-bottom: 10px;"></div><p style="font-size: 14px; font-weight: bold;">${label}</p>`;
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace("/api", "") 
      : "";
    const fullPath = path.startsWith("http") ? path : baseUrl + path;
    
    return `
      <div style="text-align: center;">
        <img src="${fullPath}" alt="${label}" style="max-height: 60px; max-width: 180px; display: block; margin: 0 auto;" />
        <div style="width: 200px; border-bottom: 1px solid #333; margin: 10px auto;"></div>
        <p style="font-size: 14px; font-weight: bold; margin: 0;">${label}</p>
      </div>
    `;
  };

  const classicTemplate = `
<div style="width: 800px; min-height: 1050px; padding: 40px; background: white; text-align: center; font-family: 'Times New Roman', serif; color: #333; box-sizing: border-box;">
  <div style="width: 100%; height: 100%; border: 5px double #144aa0; padding: 30px; box-sizing: border-box; position: relative; display: flex; flex-direction: column;">
    
    <!-- Header -->
    <div style="margin-bottom: 20px;">
      <div style="margin-bottom: 15px;">{{SCHOOL_LOGO}}</div>
      <h1 style="font-size: 32px; color: #144aa0; text-transform: uppercase; margin: 0; font-weight: bold;">{{SCHOOL_NAME}}</h1>
      <p style="font-size: 16px; color: #333; margin-top: 10px; font-style: italic; font-weight: bold;">Certificate of Achievement</p>
    </div>

    <!-- Certification Text -->
    <div style="margin: 20px 0;">
      <p style="font-size: 18px; margin: 0;">This certifies that</p>
      <h2 style="font-size: 36px; color: #000; margin: 15px 0; font-weight: bold;">{{STUDENT_NAME}}</h2>
      <p style="font-size: 14px; color: #555; margin-bottom: 30px;">
        Registration No: <strong>{{REG_NUMBER}}</strong> &bull; 
        Department: <strong>{{DEPARTMENT}}</strong> &bull; 
        Class: <strong>{{CLASS}}</strong>
      </p>
    </div>
    
    <!-- Results Table -->
    <div style="margin-bottom: 30px; flex-grow: 1;">
      <div style="text-align: center; font-weight: bold; text-transform: uppercase; color: #144aa0; margin-bottom: 15px; font-size: 14px;">
        {{YEAR}} &bull; {{EXAM_NAME}}
      </div>
      {{COURSE_TABLE}}
    </div>
    
    <!-- Summary -->
    <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; font-size: 18px; font-weight: bold;">
      <span>Total Score: {{TOTAL_SCORE}}</span>
      <span>Average: {{AVERAGE_SCORE}}</span>
    </div>
    
    <!-- Signatures -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; padding: 0 20px;">
      <div style="width: 220px;">
        {{REGISTRAR_SIGNATURE}}
      </div>
      
      <div style="text-align: center;">
        <div style="border: 1px solid #ddd; padding: 5px; display: inline-block; margin-bottom: 5px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data={{SERIAL_NUMBER}}" alt="QR" width="60" height="60" />
        </div>
        <p style="font-size: 10px; font-family: monospace; margin: 0;">{{SERIAL_NUMBER}}</p>
      </div>

      <div style="width: 220px;">
        {{PRINCIPAL_SIGNATURE}}
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #eee; padding-top: 10px; font-size: 10px; color: #999;">
      Verified Certificate | Issued by {{SCHOOL_NAME}} | {{DATE}}
    </div>

  </div>
</div>
`;

  const modernTemplate = `
<div style="width: 800px; min-height: 1050px; background: white; font-family: 'Segoe UI', Arial, sans-serif; color: #333; position: relative; overflow: hidden; display: flex; flex-direction: column;">
  
  <!-- Header Bar -->
  <div style="background: #1e3a8a; padding: 30px 40px; color: white; display: flex; align-items: center; justify-content: space-between;">
    <div style="flex: 1;">
      <h1 style="font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">{{SCHOOL_NAME}}</h1>
      <p style="font-size: 14px; opacity: 0.9; margin-top: 5px; font-weight: 500;">Official Academic Result Certificate</p>
    </div>
    <div style="background: white; padding: 8px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      {{SCHOOL_LOGO}}
    </div>
  </div>

  <div style="padding: 40px; flex-grow: 1; display: flex; flex-direction: column;">
    
    <!-- Student Profile -->
    <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 6px solid #1e3a8a; margin-bottom: 35px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <h2 style="font-size: 18px; color: #1e3a8a; margin-top: 0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Student Information</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 15px;">
        <div><span style="color: #64748b;">Full Name:</span> <strong style="color: #0f172a; display: block; font-size: 18px;">{{STUDENT_NAME}}</strong></div>
        <div><span style="color: #64748b;">Registration No:</span> <strong style="color: #0f172a; display: block; font-size: 18px;">{{REG_NUMBER}}</strong></div>
        <div><span style="color: #64748b;">Department:</span> <strong style="color: #0f172a;">{{DEPARTMENT}}</strong></div>
        <div><span style="color: #64748b;">Class:</span> <strong style="color: #0f172a;">{{CLASS}}</strong></div>
        <div><span style="color: #64748b;">Academic Year:</span> <strong style="color: #0f172a;">{{YEAR}}</strong></div>
        <div><span style="color: #64748b;">Examination:</span> <strong style="color: #0f172a;">{{EXAM_NAME}}</strong></div>
      </div>
    </div>

    <!-- Results Table -->
    <div style="margin-bottom: 35px;">
      <h3 style="font-size: 18px; color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Academic Performance</h3>
      {{COURSE_TABLE}}
    </div>

    <!-- Summary -->
    <div style="display: flex; gap: 25px; justify-content: flex-end; margin-bottom: 50px;">
      <div style="background: #1e3a8a; color: white; padding: 15px 30px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
        <div style="font-size: 12px; text-transform: uppercase; opacity: 0.8; letter-spacing: 1px; margin-bottom: 5px;">Total Score</div>
        <div style="font-size: 28px; font-weight: bold;">{{TOTAL_SCORE}}</div>
      </div>
      <div style="background: #0f172a; color: white; padding: 15px 30px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px rgba(15, 23, 42, 0.2);">
        <div style="font-size: 12px; text-transform: uppercase; opacity: 0.8; letter-spacing: 1px; margin-bottom: 5px;">Average</div>
        <div style="font-size: 28px; font-weight: bold;">{{AVERAGE_SCORE}}</div>
      </div>
    </div>

    <!-- Signatures Section -->
    <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 20px;">
      <div style="width: 200px; text-align: center;">
        {{REGISTRAR_SIGNATURE}}
      </div>
      
      <div style="text-align: center;">
         <img src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data={{SERIAL_NUMBER}}" alt="QR" width="70" height="70" style="margin-bottom: 10px;" />
         <p style="font-size: 11px; color: #64748b; font-family: monospace; margin: 0;">{{SERIAL_NUMBER}}</p>
      </div>

      <div style="width: 200px; text-align: center;">
        {{PRINCIPAL_SIGNATURE}}
      </div>
    </div>

  </div>
  
  <!-- Footer Bar -->
  <div style="background: #1e3a8a; padding: 15px 40px; color: white; display: flex; justify-content: space-between; font-size: 12px;">
    <span>Verified Digital Certificate</span>
    <span>Issued on: {{DATE}}</span>
  </div>
</div>
`;

  const premiumTemplate = `
<div style="width: 800px; min-height: 1050px; padding: 50px; background: #fffcf5; text-align: center; font-family: 'Georgia', serif; color: #2c1810; box-sizing: border-box; position: relative; display: flex; flex-direction: column;">
  
  <!-- Elaborate Border -->
  <div style="position: absolute; top: 15px; left: 15px; right: 15px; bottom: 15px; border: 3px solid #b45309; pointer-events: none;"></div>
  <div style="position: absolute; top: 22px; left: 22px; right: 22px; bottom: 22px; border: 1px solid #b45309; pointer-events: none;"></div>
  
  <!-- Decorative Corners -->
  <div style="position: absolute; top: 15px; left: 15px; width: 60px; height: 60px; border-top: 8px solid #b45309; border-left: 8px solid #b45309;"></div>
  <div style="position: absolute; top: 15px; right: 15px; width: 60px; height: 60px; border-top: 8px solid #b45309; border-right: 8px solid #b45309;"></div>
  <div style="position: absolute; bottom: 15px; left: 15px; width: 60px; height: 60px; border-bottom: 8px solid #b45309; border-left: 8px solid #b45309;"></div>
  <div style="position: absolute; bottom: 15px; right: 15px; width: 60px; height: 60px; border-bottom: 8px solid #b45309; border-right: 8px solid #b45309;"></div>

  <div style="position: relative; z-index: 10; flex-grow: 1; display: flex; flex-direction: column;">
    
    <div style="margin-bottom: 25px; margin-top: 20px;">{{SCHOOL_LOGO}}</div>
    
    <h1 style="font-size: 38px; color: #78350f; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 3px; font-weight: bold;">{{SCHOOL_NAME}}</h1>
    
    <div style="width: 150px; height: 2px; background: #b45309; margin: 20px auto;"></div>
    
    <h2 style="font-size: 26px; font-style: italic; color: #451a03; margin-bottom: 45px;">Certificate of Achievement</h2>
    
    <p style="font-size: 20px; margin-bottom: 15px;">This certifies that</p>
    <h3 style="font-size: 42px; color: #000; margin: 10px 0 35px 0; font-weight: bold; border-bottom: 1px solid #e7e5e4; display: inline-block; padding-bottom: 10px;">{{STUDENT_NAME}}</h3>
    
    <p style="font-size: 18px; margin-bottom: 40px; color: #451a03;">
      Registration No: <strong>{{REG_NUMBER}}</strong> &bull; Class: <strong>{{CLASS}}</strong> &bull; Dept: <strong>{{DEPARTMENT}}</strong>
    </p>

    <!-- Results -->
    <div style="background: rgba(255,255,255,0.9); border: 2px solid #fde68a; padding: 25px; margin-bottom: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-radius: 4px;">
      <h4 style="margin: 0 0 20px 0; text-transform: uppercase; font-size: 16px; letter-spacing: 2px; color: #78350f; font-weight: bold;">{{EXAM_NAME}} - {{YEAR}}</h4>
      {{COURSE_TABLE}}
      
      <div style="display: flex; justify-content: center; gap: 60px; margin-top: 25px; font-size: 20px; border-top: 1px solid #fde68a; padding-top: 20px;">
        <div>Total Score: <strong style="color: #78350f;">{{TOTAL_SCORE}}</strong></div>
        <div>Average: <strong style="color: #78350f;">{{AVERAGE_SCORE}}</strong></div>
      </div>
    </div>

    <!-- Signatures -->
    <div style="display: flex; justify-content: space-between; margin-top: auto; padding: 0 50px 40px 50px;">
      <div style="width: 220px;">
        {{REGISTRAR_SIGNATURE}}
      </div>
      <div style="width: 220px;">
        {{PRINCIPAL_SIGNATURE}}
      </div>
    </div>
    
    <!-- Footer Verification -->
    <div style="margin-bottom: 20px; font-size: 11px; color: #78350f; opacity: 0.8; font-family: monospace;">
      Verified Certificate | Serial: {{SERIAL_NUMBER}} | Issued by ITMT Portal
    </div>

  </div>
</div>
`;

  useEffect(() => {
    loadTemplates();
    loadSchoolSettings();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchCertificateTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolSettings = async () => {
    try {
      const settings = await fetchSchoolSettings();
      setSchoolSettings(settings);
    } catch (error) {
      console.error("Failed to load school settings", error);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      templateHtml: classicTemplate,
      isActive: false
    });
    setIsModalOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      templateHtml: template.templateHtml,
      isActive: template.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteCertificateTemplate(id);
      loadTemplates();
    } catch (error) {
      console.error("Failed to delete template", error);
      alert("Failed to delete template");
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateCertificateTemplate(id);
      loadTemplates();
    } catch (error) {
      console.error("Failed to activate template", error);
      alert("Failed to activate template");
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(false); // Reset to ensure animation triggers
    setTimeout(() => setIsPreviewOpen(true), 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await updateCertificateTemplate(editingTemplate.id, formData);
      } else {
        await createCertificateTemplate(formData);
      }
      setIsModalOpen(false);
      loadTemplates();
    } catch (error) {
      console.error("Failed to save template", error);
      alert("Failed to save template");
    }
  };

  const renderPreview = (html) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace("/api", "") 
      : "";

    const safeSchoolName = schoolSettings?.schoolName || "International Technical Management Institute";
    const logoHtml = schoolSettings?.schoolLogo 
      ? `<img src="${baseUrl + schoolSettings.schoolLogo}" alt="Logo" style="max-height: 80px; max-width: 80px;" />` 
      : `<div style="font-size: 24px; font-weight: bold; color: #1e3a8a;">${safeSchoolName.charAt(0)}</div>`;

    const regSigHtml = getSignatureHtml(schoolSettings?.registrarSignature, "Registrar");
    const princSigHtml = getSignatureHtml(schoolSettings?.principalSignature, "Principal");

    let preview = html
      .replace(/{{SCHOOL_NAME}}/g, safeSchoolName)
      .replace(/{{SCHOOL_LOGO}}/g, logoHtml)
      .replace(/{{REGISTRAR_SIGNATURE}}/g, regSigHtml)
      .replace(/{{PRINCIPAL_SIGNATURE}}/g, princSigHtml)
      .replace(/{{STUDENT_NAME}}/g, "John Doe")
      .replace(/{{REG_NUMBER}}/g, "ITMT/2026/001")
      .replace(/{{EXAM_NAME}}/g, "Final Semester Exam")
      .replace(/{{YEAR}}/g, "2026/2027")
      .replace(/{{DEPARTMENT}}/g, "Computer Science")
      .replace(/{{CLASS}}/g, "SS3")
      .replace(/{{TOTAL_SCORE}}/g, "540")
      .replace(/{{AVERAGE_SCORE}}/g, "78.5")
      .replace(/{{SERIAL_NUMBER}}/g, "CERT-2026-001")
      .replace(/{{DATE}}/g, new Date().toLocaleDateString())
      .replace(/{{DATE_NOW}}/g, new Date().toLocaleDateString())
      .replace(/{{COURSE_TABLE}}/g, `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 20px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0; color: #1e3a8a;">#</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0; color: #1e3a8a;">Course Code</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0; color: #1e3a8a;">Course Title</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0; color: #1e3a8a;">Score</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0; color: #1e3a8a;">Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 10px; border: 1px solid #e2e8f0;">1</td><td style="padding: 10px; border: 1px solid #e2e8f0;">MTH101</td><td style="padding: 10px; border: 1px solid #e2e8f0;">Mathematics</td><td style="padding: 10px; border: 1px solid #e2e8f0;">85</td><td style="padding: 10px; border: 1px solid #e2e8f0;">A</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e2e8f0;">2</td><td style="padding: 10px; border: 1px solid #e2e8f0;">ENG101</td><td style="padding: 10px; border: 1px solid #e2e8f0;">English Language</td><td style="padding: 10px; border: 1px solid #e2e8f0;">78</td><td style="padding: 10px; border: 1px solid #e2e8f0;">B</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e2e8f0;">3</td><td style="padding: 10px; border: 1px solid #e2e8f0;">PHY101</td><td style="padding: 10px; border: 1px solid #e2e8f0;">Physics</td><td style="padding: 10px; border: 1px solid #e2e8f0;">92</td><td style="padding: 10px; border: 1px solid #e2e8f0;">A</td></tr>
          </tbody>
        </table>
      `);
    
    return { __html: preview };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certificate Templates</h2>
          <p className="text-gray-500">Manage result certificate designs used when students download their results.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadTemplates}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Create New Template
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${template.isActive ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'} overflow-hidden flex flex-col`}>
              <div className="h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 relative group cursor-pointer" onClick={() => handlePreview(template)}>
                <FileText size={64} className="text-gray-300 group-hover:text-blue-200 transition-colors" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <Eye size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {template.isActive && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle size={10} /> ACTIVE
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{template.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{template.description || "No description provided."}</p>
                
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handlePreview(template)}
                      className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors" 
                      title="Preview"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {!template.isActive ? (
                    <button 
                      onClick={() => handleActivate(template.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors uppercase tracking-tight"
                    >
                      Set as Active
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} /> IN USE
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {templates.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Award size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Templates Found</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Design professional result certificates that students can download from their portal.</p>
              <button 
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <Plus size={20} />
                Create First Template
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingTemplate ? "Edit Certificate Template" : "New Certificate Template"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Customize how results are presented to students.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Form Controls */}
              <div className="w-full md:w-80 p-6 border-r border-gray-100 overflow-y-auto bg-gray-50/50 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Template Identity</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="e.g. Standard Layout 2026"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brief Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none h-20"
                      placeholder="Purpose of this template..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Design Presets</label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, templateHtml: classicTemplate })}
                      className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-gray-700 text-left flex items-center justify-between"
                    >
                      Classic Format
                      <Award size={14} className="opacity-40" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, templateHtml: modernTemplate })}
                      className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-gray-700 text-left flex items-center justify-between"
                    >
                      Modern Transcript
                      <CheckCircle size={14} className="opacity-40" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, templateHtml: premiumTemplate })}
                      className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-gray-700 text-left flex items-center justify-between"
                    >
                      Premium Certificate
                      <Award size={14} className="opacity-40" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Set as Primary Template</label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                    >
                      {editingTemplate ? "Update Template" : "Save Template"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full py-2 bg-white text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HTML/CSS SOURCE CODE</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handlePreview({ ...formData })} className="text-[10px] font-bold text-blue-600 hover:underline px-2 py-1">Quick Preview</button>
                  </div>
                </div>
                <textarea
                  required
                  value={formData.templateHtml}
                  onChange={(e) => setFormData({...formData, templateHtml: e.target.value})}
                  className="flex-1 w-full p-6 font-mono text-sm focus:outline-none resize-none bg-white leading-relaxed"
                  placeholder="<!-- Write your certificate HTML here -->"
                />
                <div className="px-6 py-3 border-t border-gray-100 bg-blue-50/30">
                  <p className="text-[10px] font-bold text-blue-900/60 uppercase tracking-widest mb-2">Available Smart Tags (Click to copy disabled in this version)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['STUDENT_NAME', 'REG_NUMBER', 'DEPARTMENT', 'CLASS', 'YEAR', 'EXAM_NAME', 'COURSE_TABLE', 'TOTAL_SCORE', 'AVERAGE_SCORE', 'SERIAL_NUMBER', 'SCHOOL_NAME', 'SCHOOL_LOGO', 'REGISTRAR_SIGNATURE', 'PRINCIPAL_SIGNATURE', 'DATE_NOW'].map(tag => (
                      <code key={tag} className="text-[10px] bg-white border border-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">{`{{${tag}}}`}</code>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && previewTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Certificate Preview: {previewTemplate.name || "Untitled"}</h3>
                <p className="text-xs text-gray-500">This is how the result will look when downloaded.</p>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-12 bg-gray-200/50 flex justify-center">
              <div 
                className="bg-white shadow-2xl origin-top scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-100 transition-all"
                style={{ width: '800px', minHeight: '1050px' }}
                dangerouslySetInnerHTML={renderPreview(previewTemplate.templateHtml)}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-center">
              <button onClick={() => setIsPreviewOpen(false)} className="px-8 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
