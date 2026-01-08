"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Save, Check, AlertCircle } from "lucide-react";
import { useFormContext } from "../context/FormContext";
import InputField from "../components/InputField";
import Toast from "../components/Toast";
import StarRating from "../components/StarRating";
import styles from "../components/SidePanel.module.css";
import { notFound } from "next/navigation";

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
  notFound();
}
