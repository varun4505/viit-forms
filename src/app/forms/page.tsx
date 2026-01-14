"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Save, Check, AlertCircle } from "lucide-react";
import { useFormContext } from "../context/FormContext";
import InputField from "../components/InputField";
import Toast from "../components/Toast";
import StarRating from "../components/StarRating";
import styles from "../components/SidePanel.module.css";

const AUTOSAVE_KEY = "viit-member-profile-v1";

// Regex Patterns
const REG_NUMBER_REGEX = /^(24|25)[A-Z]{3}[0-9]{4}$/i;
const VIT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const BLOCK_REGEX = /^[A-Z]$/;
const ROOM_REGEX = /^[0-9]{1,4}$/;

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function FormsPage() {
  const { setActiveSection } = useFormContext();

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info" as "success" | "error" | "info",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const observerRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const [formData, setFormData] = useState({
    name: "",
    regNumber: "",
    phoneNumber: "",
    branchSpecialization: "",
    gender: "",
    dob: "",
    vitEmail: "",
    personalEmail: "",
    cgpa: "",
    hostelBlock: "",
    hostelRoom: "",
    domain: "",
    subDomain: "",
    projects: "",
    commitment: 5,
    commitmentJustification: "",
  });

  const domainOptionsMap = {
    Tech: [
      "Web Development",
      "App Development",
      "AI/ML",
      "Cybersecurity",
      "Competitive Coding",
    ],
    Design: ["UI/UX / Graphic Design", "Video Editing/Motion Graphics"],
    Management: [],
  };

  // --- Effects ---

  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
        setLastSaved(new Date());
      } catch (e) {
        console.error("Failed to parse autosave data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const t = setTimeout(() => {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
        setLastSaved(new Date());
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [formData, isLoaded]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4, rootMargin: "-10% 0px -40% 0px" }
    );
    Object.values(observerRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [setActiveSection]);

  // --- Validation Logic ---

  const validateField = (
    field: string,
    value: string | number
  ): string | null => {
    if (!value || (typeof value === "string" && !value.trim())) {
      if (field === "subDomain") {
        const domainOpts =
          domainOptionsMap[formData.domain as keyof typeof domainOptionsMap];
        if (formData.domain && domainOpts?.length > 0)
          return "Subdomain is required";
        return null;
      }
      return "This field is required";
    }

    const stringValue = value.toString();

    switch (field) {
      case "regNumber":
        if (!REG_NUMBER_REGEX.test(stringValue))
          return "Must start with '24' or '25' (e.g., 25BCE...)";
        break;
      case "phoneNumber":
        if (!PHONE_REGEX.test(stringValue)) return "Must be exactly 10 digits";
        break;
      case "vitEmail":
        if (!VIT_EMAIL_REGEX.test(stringValue))
          return "Must end with @vitstudent.ac.in";
        break;
      case "personalEmail":
        if (!EMAIL_REGEX.test(stringValue)) return "Invalid email format";
        break;
      case "dob":
        const birthDate = new Date(stringValue);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age < 13) return "You must be at least 13 years old";
        break;
      case "cgpa":
        const cgpaRegex = /^([0-9]\.[0-9]{2}|10\.00)$/;
        if (!cgpaRegex.test(stringValue))
          return "Format must be X.XX (e.g., 9.50)";
        const val = parseFloat(stringValue);
        if (val < 0 || val > 10) return "CGPA cannot exceed 10";
        break;
      case "hostelBlock":
        if (!BLOCK_REGEX.test(stringValue))
          return "Enter a single letter (e.g., 'A')";
        break;
      case "hostelRoom":
        if (!ROOM_REGEX.test(stringValue)) return "Max 4 digits allowed";
        break;
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate all keys in formData
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    // Instant validation on blur
    const error = validateField(
      field,
      formData[field as keyof typeof formData]
    );
    setErrors((prev) => {
      const newErr = { ...prev };
      if (error) {
        newErr[field] = error;
      } else {
        delete newErr[field];
      }
      return newErr;
    });
  };

  const handleChange = (field: string, value: string | number) => {
    let processedValue = value;

    if (field === "hostelBlock" && typeof value === "string") {
      processedValue = value.toUpperCase().slice(0, 1);
      if (processedValue && !/^[A-Z]$/.test(processedValue)) return;
    }

    if (field === "hostelRoom" && typeof value === "string") {
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    if (submitStatus === "error") setSubmitStatus("idle");

    // Clear error immediately on change if user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  const handleDomainChange = (value: string) => {
    setFormData((prev) => ({ ...prev, domain: value, subDomain: "" }));
    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr.domain;
      delete newErr.subDomain;
      return newErr;
    });
  };

  const triggerErrorState = (msg: string) => {
    setSubmitStatus("error");
    setStatusMessage(msg);
    setTimeout(() => setSubmitStatus("idle"), 5000);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const msg = "Please fix the errors in the form.";
      setToast({ show: true, message: msg, type: "error" });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      triggerErrorState(msg);
      return;
    }

    setSubmitStatus("submitting");

    const apiPayload = {
      personalInfo: {
        name: formData.name,
        regNumber: formData.regNumber.toUpperCase(),
        phoneNumber: formData.phoneNumber,
        branchSpecialization: formData.branchSpecialization,
        gender: formData.gender,
        dob: formData.dob,
        vitEmail: formData.vitEmail.toLowerCase(),
        personalEmail: formData.personalEmail.toLowerCase(),
        cgpa: parseFloat(formData.cgpa),
        hostelBlock: formData.hostelBlock,
        hostelRoom: formData.hostelRoom,
      },
      domainInfo: {
        domain: formData.domain,
        subDomain: formData.subDomain,
        projects: formData.projects,
      },
      commitmentInfo: {
        commitment: formData.commitment,
        commitmentJustification: formData.commitmentJustification,
      },
    };

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });
      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        setToast({
          show: true,
          message: "Profile updated successfully!",
          type: "success",
        });
        localStorage.removeItem(AUTOSAVE_KEY);
        setLastSaved(null);

        setTimeout(() => {
          setSubmitStatus("idle");
          setToast((prev) => ({ ...prev, show: false }));
        }, 5000);
      } else {
        const msg = result.error || "Submission failed";
        setToast({ show: true, message: msg, type: "error" });
        triggerErrorState(msg);
      }
    } catch {
      const msg = "Network error";
      setToast({ show: true, message: msg, type: "error" });
      triggerErrorState(msg);
    }
  };

  const getButtonClass = () => {
    const base =
      "w-full transition-all duration-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg";

    switch (submitStatus) {
      case "success":
        return `${base} bg-green-600 text-white cursor-default transform scale-105`;
      case "error":
        return `${base} bg-red-600 text-white hover:bg-red-700`;
      case "submitting":
        return `${base} bg-neutral-800 text-white cursor-wait opacity-80`;
      default:
        return "btn-primary group w-full";
    }
  };

  const getHostelHeader = () => {
    if (formData.gender === "Male") return "Men's Hostel Details";
    if (formData.gender === "Female") return "Ladies' Hostel Details";
    return "Hostel Details";
  };

  return (
    <div className="w-full">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      {/* Form Container */}
      <div className="max-w-5xl mx-auto p-6 md:p-16 space-y-24 md:space-y-32">
        {/* PERSONAL SECTION */}
        <section
          id="personal"
          ref={(el) => {
            observerRefs.current["personal"] = el;
          }}
          className={`scroll-mt-32 md:scroll-mt-10 ${styles.staggerContainer}`}
        >
          {/* Mobile Header */}
          <div className="md:hidden mb-8 pb-2 border-b border-white/10">
            <h2 className="text-3xl font-bold text-white">Personal Details</h2>
            <p className="text-neutral-400 text-sm mt-1">Basic contact info.</p>
          </div>

          <div className="space-y-8">
            <div
              className={`grid md:grid-cols-2 gap-8 ${styles.animateSlideUp}`}
            >
              <InputField
                id="name"
                label="Full Name"
                value={formData.name}
                onChange={(v) => handleChange("name", v)}
                onBlur={() => handleBlur("name")}
                required
                placeholder="John Doe"
                error={errors.name}
              />
              <InputField
                id="regNumber"
                label="Registration Number"
                value={formData.regNumber}
                onChange={(v) => handleChange("regNumber", v)}
                onBlur={() => handleBlur("regNumber")}
                required
                placeholder="25BCE0001"
                error={errors.regNumber}
              />
            </div>
            <div
              className={`grid md:grid-cols-2 gap-8 ${styles.animateSlideUp}`}
            >
              <InputField
                id="vitEmail"
                label="VIT Email"
                type="email"
                value={formData.vitEmail}
                onChange={(v) => handleChange("vitEmail", v)}
                onBlur={() => handleBlur("vitEmail")}
                required
                placeholder="john.doe2025@vitstudent.ac.in"
                error={errors.vitEmail}
              />
              <InputField
                id="personalEmail"
                label="Personal Email"
                type="email"
                value={formData.personalEmail}
                onChange={(v) => handleChange("personalEmail", v)}
                onBlur={() => handleBlur("personalEmail")}
                required
                placeholder="johndoe@gmail.com"
                error={errors.personalEmail}
              />
            </div>
            <div
              className={`grid md:grid-cols-2 gap-8 ${styles.animateSlideUp}`}
            >
              <InputField
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                value={formData.phoneNumber}
                onChange={(v) => handleChange("phoneNumber", v)}
                onBlur={() => handleBlur("phoneNumber")}
                required
                error={errors.phoneNumber}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="gender"
                  label="Gender"
                  type="select"
                  value={formData.gender}
                  onChange={(v) => handleChange("gender", v)}
                  onBlur={() => handleBlur("gender")}
                  required
                  options={["Male", "Female", "Other"]}
                  error={errors.gender}
                />
                <InputField
                  id="dob"
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(v) => handleChange("dob", v)}
                  onBlur={() => handleBlur("dob")}
                  required
                  error={errors.dob}
                />
              </div>
            </div>

            {/* BRANCH & CGPA (Moved above Hostel) */}
            <div
              className={`grid md:grid-cols-2 gap-8 ${styles.animateSlideUp}`}
            >
              <InputField
                id="branchSpecialization"
                label="Branch"
                value={formData.branchSpecialization}
                onChange={(v) => handleChange("branchSpecialization", v)}
                onBlur={() => handleBlur("branchSpecialization")}
                required
                placeholder="CSE Core"
                error={errors.branchSpecialization}
              />
              <InputField
                id="cgpa"
                label="CGPA"
                type="number"
                value={formData.cgpa}
                onChange={(v) => handleChange("cgpa", v)}
                onBlur={() => handleBlur("cgpa")}
                required
                placeholder="9.31"
                error={errors.cgpa}
              />
            </div>

            {/* HOSTEL DETAILS SUBSECTION */}
            <div
              className={`pt-6 border-t border-white/5 ${styles.animateSlideUp}`}
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                {getHostelHeader()}
              </h3>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <InputField
                  id="hostelBlock"
                  label="Block"
                  value={formData.hostelBlock}
                  onChange={(v) => handleChange("hostelBlock", v)}
                  onBlur={() => handleBlur("hostelBlock")}
                  required
                  placeholder="A"
                  error={errors.hostelBlock}
                />
                <InputField
                  id="hostelRoom"
                  label="Room No."
                  type="number"
                  value={formData.hostelRoom}
                  onChange={(v) => handleChange("hostelRoom", v)}
                  onBlur={() => handleBlur("hostelRoom")}
                  required
                  placeholder="101"
                  error={errors.hostelRoom}
                />
              </div>
            </div>
          </div>
        </section>

        {/* DOMAIN SECTION */}
        <section
          id="domain"
          ref={(el) => {
            observerRefs.current["domain"] = el;
          }}
          className={`scroll-mt-32 md:scroll-mt-10 ${styles.staggerContainer}`}
        >
          <div className="md:hidden mb-8 pb-2 border-b border-white/10">
            <h2 className="text-3xl font-bold text-white">Domain & Work</h2>
            <p className="text-neutral-400 text-sm mt-1">
              Showcase your skills.
            </p>
          </div>

          <div className="space-y-8">
            <div
              className={`grid md:grid-cols-2 gap-8 ${styles.animateSlideUp}`}
            >
              <InputField
                id="domain"
                label="Domain"
                type="select"
                value={formData.domain}
                onChange={handleDomainChange}
                onBlur={() => handleBlur("domain")}
                required
                options={["Tech", "Design", "Management"]}
                error={errors.domain}
              />
              {formData.domain &&
                domainOptionsMap[
                  formData.domain as keyof typeof domainOptionsMap
                ]?.length > 0 && (
                  <InputField
                    id="subDomain"
                    label="Subdomain"
                    type="select"
                    value={formData.subDomain}
                    onChange={(v) => handleChange("subDomain", v)}
                    onBlur={() => handleBlur("subDomain")}
                    required
                    options={
                      domainOptionsMap[
                        formData.domain as keyof typeof domainOptionsMap
                      ]
                    }
                    error={errors.subDomain}
                  />
                )}
            </div>
            <div className={styles.animateSlideUp}>
              <InputField
                id="projects"
                label="Past Experience in Domain"
                type="textarea"
                value={formData.projects}
                onChange={(v) => handleChange("projects", v)}
                onBlur={() => handleBlur("projects")}
                required
                placeholder="Describe your role, projects built, or events managed..."
                error={errors.projects}
              />
            </div>
          </div>
        </section>

        {/* COMMITMENT SECTION */}
        <section
          id="commitment"
          ref={(el) => {
            observerRefs.current["commitment"] = el;
          }}
          className={`scroll-mt-32 md:scroll-mt-10 pb-32 ${styles.staggerContainer}`}
        >
          <div className="md:hidden mb-8 pb-2 border-b border-white/10">
            <h2 className="text-3xl font-bold text-white">Commitment</h2>
            <p className="text-neutral-400 text-sm mt-1">Dedication check.</p>
          </div>

          <div className="space-y-10">
            <div
              className={`${styles.animateSlideUp} bg-neutral-900/40 p-8 rounded-4xl border border-white/5`}
            >
              <label className="block text-neutral-300 text-lg font-bold mb-4 tracking-wide text-center">
                Commitment Level
              </label>
              <div className="flex flex-col gap-2 w-full">
                <StarRating
                  value={formData.commitment}
                  onChange={(val) => handleChange("commitment", val)}
                />
              </div>
            </div>
            <div className={styles.animateSlideUp}>
              <InputField
                id="commitmentJustification"
                label="Justify your rating"
                type="textarea"
                value={formData.commitmentJustification}
                onChange={(v) => handleChange("commitmentJustification", v)}
                onBlur={() => handleBlur("commitmentJustification")}
                required
                placeholder="How will you balance your time?"
                error={errors.commitmentJustification}
              />
            </div>
          </div>

          {/* DYNAMIC SUBMIT BUTTON */}
          <div
            className={`mt-16 pt-8 border-t border-white/10 ${styles.animateSlideUp}`}
          >
            <button
              onClick={handleSubmit}
              disabled={
                submitStatus === "submitting" || submitStatus === "success"
              }
              className={getButtonClass()}
            >
              {submitStatus === "submitting" && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              )}

              {submitStatus === "idle" && (
                <>
                  Submit Profile
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}

              {submitStatus === "success" && (
                <>
                  <Check className="w-6 h-6" />
                  SUBMITTED
                </>
              )}

              {submitStatus === "error" && (
                <>
                  <AlertCircle className="w-5 h-5" />
                  {statusMessage}
                </>
              )}
            </button>

            {lastSaved && (
              <div className="fixed -bottom-20 self-center z-50 bg-black/80 backdrop-blur-md text-white/70 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/10 animate-fadeIn">
                <Save className="w-3 h-3" />
                Saved{" "}
                {lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
