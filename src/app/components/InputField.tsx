import React from "react";

const InputField: React.FC<{
  id: string;
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  options?: string[];
}> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  required = false,
  placeholder,
  error,
  options,
}) => {
  // Changed border from default (1px) to border-2 (2px)
  const baseClasses = "input-field border-2";
  const textareaClasses = "input-textarea border-2";

  // Error border vs Normal border
  const errorClasses = error
    ? "border-red-500"
    : "border-white/10 focus:border-purple-500/50";

  if (type === "select" && options) {
    return (
      <div className="mb-4 w-full group">
        <label
          className="block text-purple-300 text-sm font-bold mb-2 transition-colors group-hover:text-purple-200"
          htmlFor={id}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={required}
            className={`${baseClasses} ${errorClasses}`}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {/* Custom Chevron */}
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-1 font-medium animate-pulse">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="mb-4 w-full group">
        <label
          className="block text-purple-300 text-sm font-bold mb-2 transition-colors group-hover:text-purple-200"
          htmlFor={id}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={required}
            placeholder={placeholder}
            rows={4}
            className={`${textareaClasses} ${errorClasses}`}
          />
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-1 font-medium animate-pulse">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 w-full group">
      <label
        className="block text-purple-300 text-sm font-bold mb-2 transition-colors group-hover:text-purple-200"
        htmlFor={id}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          className={`${baseClasses} ${errorClasses}`}
        />
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1 font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
